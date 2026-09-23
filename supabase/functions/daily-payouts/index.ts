import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  PAYOUT_TIMEZONE,
  eligibleWeekdayBatchDates,
  isZonedWeekday,
  zonedStartOfDay,
} from "../_shared/investment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Holding {
  id: string;
  user_id: string;
  shares: number;
  amount_invested: number;
  daily_payout: number;
  total_projected_return: number;
  start_date: string;
  end_date: string;
  weekdays_paid: number;
  total_paid: number;
  status: string;
}

interface Payout {
  id: string;
  holding_id: string;
  user_id: string;
  payout_date: string;
  amount: number;
  running_total: number;
  weekdays_paid: number;
  marked_by: string | null;
  marked_at: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET")!;

    // Verify cron secret
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const today = zonedStartOfDay(now);

    // Skip weekends - no payouts on Saturday (6) or Sunday (0) in IST
    if (!isZonedWeekday(today)) {
      return new Response(JSON.stringify({ 
        message: "Weekend - no payouts generated",
        day: today.toLocaleDateString("en-US", { weekday: "long", timeZone: PAYOUT_TIMEZONE })
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all active holdings with user + bank profile
    const { data: holdings, error: holdingsError } = await supabase
      .from("holdings")
      .select(`
        *,
        user:users!holdings_user_id_fkey(
          id, name, email,
          profiles:profiles!profiles_user_id_fkey(phone, account_holder_name, account_number, ifsc_code, upi_id)
        )
      `)
      .eq("status", "ACTIVE");

    if (holdingsError) throw holdingsError;

    // Get all existing payout rows for active holdings
    const activeHoldingIds = (holdings || []).map((h) => h.id);
    const { data: allPayouts, error: payoutsError } = await supabase
      .from("payouts")
      .select("*")
      .in("holding_id", activeHoldingIds.length > 0 ? activeHoldingIds : ["__none__"]);

    if (payoutsError) throw payoutsError;

    const existingByHolding = new Map<string, Map<string, Payout>>();
    for (const payout of allPayouts || []) {
      if (!existingByHolding.has(payout.holding_id)) {
        existingByHolding.set(payout.holding_id, new Map());
      }
      existingByHolding.get(payout.holding_id)!.set(payout.payout_date.slice(0, 10), payout);
    }

    let generatedCount = 0;
    let skippedCount = 0;

    // Generate payouts for each active holding
    for (const holding of holdings || []) {
      const startDate = new Date(holding.start_date);
      const endDate = new Date(holding.end_date);
      if (endDate < today) continue;

      const eligibleDates = eligibleWeekdayBatchDates(startDate, now);
      const holdingRows = existingByHolding.get(holding.id) || new Map();
      const confirmedWeekdays = holding.weekdays_paid || 0;

      for (let i = 0; i < eligibleDates.length; i++) {
        const batchIndex = i + 1;
        if (batchIndex <= confirmedWeekdays) continue;

        const date = eligibleDates[i];
        const dateKey = date.toISOString().slice(0, 10);
        let row = holdingRows.get(dateKey);

        if (!row) {
          const runningTotal = Number(holding.total_paid) + Number(holding.daily_payout) * (batchIndex - confirmedWeekdays);
          const { data: newRow, error: insertError } = await supabase
            .from("payouts")
            .insert({
              holding_id: holding.id,
              user_id: holding.user_id,
              payout_date: date.toISOString(),
              amount: holding.daily_payout,
              running_total: runningTotal,
              weekdays_paid: batchIndex,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          row = newRow;
          holdingRows.set(dateKey, row);
          generatedCount++;

          // Create notification for user
          await supabase.from("notifications").insert({
            user_id: holding.user_id,
            type: "payout_scheduled",
            title: "Daily Payout Scheduled",
            message: `₹${Number(holding.daily_payout).toLocaleString("en-IN")} has been scheduled for ${date.toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: PAYOUT_TIMEZONE })} for holding ${holding.shares} lot${holding.shares > 1 ? "s" : ""}. Running total: ₹${runningTotal.toLocaleString("en-IN")}.`,
            data: {
              payout_id: newRow.id,
              amount: Number(holding.daily_payout),
              running_total: runningTotal,
              weekdays_paid: batchIndex,
            },
          });
        } else {
          skippedCount++;
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      date: today.toISOString().slice(0, 10),
      generated: generatedCount,
      skipped: skippedCount,
      message: `Generated ${generatedCount} payouts for ${today.toLocaleDateString("en-IN", { weekday: "long", timeZone: PAYOUT_TIMEZONE })}`
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Daily payout generation error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});