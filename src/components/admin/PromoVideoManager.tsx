'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Video, UploadCloud, Trash2, Loader2, CheckCircle2,
  AlertCircle, RefreshCw, Play,
} from 'lucide-react';

interface SiteVideo {
  url: string | null;
  path: string | null;
  updatedAt: string | null;
}

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm'];

async function fetchSiteVideo(): Promise<SiteVideo> {
  const res = await fetch('/api/admin/site-video');
  if (!res.ok) throw new Error('Failed to load video');
  return res.json();
}

type Status = 'idle' | 'uploading' | 'success' | 'error';

export default function PromoVideoManager() {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['siteVideo'],
    queryFn: fetchSiteVideo,
    refetchOnWindowFocus: true,
  });

  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const hasVideo = Boolean(data?.url);

  const resetFeedback = () => {
    setStatus('idle');
    setProgress(0);
    setMessage(null);
  };

  const uploadFile = async (file: File) => {
    resetFeedback();

    if (!ALLOWED_TYPES.includes(file.type)) {
      setStatus('error');
      setMessage('Only MP4 or WebM videos are allowed.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setStatus('error');
      setMessage('Video must be 20 MB or smaller.');
      return;
    }

    setStatus('uploading');
    setProgress(0);

    try {
      const signRes = await fetch('/api/admin/site-video/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || 'Failed to prepare upload');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', signData.url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error('Video upload failed'));
        };
        xhr.onerror = () => reject(new Error('Video upload failed'));
        xhr.send(file);
      });

      const saveRes = await fetch('/api/admin/site-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: signData.path }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || 'Failed to save video');

      setProgress(100);
      setStatus('success');
      setMessage('Video uploaded successfully.');
      await queryClient.invalidateQueries({ queryKey: ['siteVideo'] });

      setTimeout(() => {
        setStatus('idle');
        setProgress(0);
      }, 3500);
    } catch (err) {
      setStatus('error');
      setProgress(0);
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
    e.target.value = '';
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const handleDelete = async () => {
    setDeleting(true);
    resetFeedback();
    try {
      const res = await fetch('/api/admin/site-video', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to delete video');
      }
      setConfirmDelete(false);
      await queryClient.invalidateQueries({ queryKey: ['siteVideo'] });
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#d8f3dc] p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-[#d8f3dc] flex items-center justify-center flex-shrink-0">
          <Video className="w-5 h-5 text-[#2d6a4f]" />
        </div>
        <div>
          <h2 className="font-bold text-lg text-[#1a2e1a]">Homepage Promo Video</h2>
          <p className="text-sm text-[#52796f] mt-0.5">
            Shown in a 9:16 frame on <strong>mobile &amp; tablet</strong> in the homepage
            &ldquo;Investment Opportunity&rdquo; section. Changes appear live within seconds.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3 text-[#52796f] text-sm py-6 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading video…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Failed to load the current video.
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Preview / dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => status !== 'uploading' && inputRef.current?.click()}
            className={`relative w-full sm:w-36 flex-shrink-0 aspect-[9/16] rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
              dragging
                ? 'border-[#2d6a4f] bg-[#f0f7f0] scale-[1.02]'
                : hasVideo
                ? 'border-transparent bg-black'
                : 'border-[#95d5b2] bg-[#fafdf7] hover:bg-[#f0f7f0]'
            }`}
          >
            {hasVideo ? (
              <>
                <video
                  key={data?.updatedAt ?? 'v'}
                  src={data?.url ?? undefined}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                  <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center px-3">
                {status === 'uploading' ? (
                  <Loader2 className="w-7 h-7 text-[#2d6a4f] animate-spin mx-auto" />
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-[#2d6a4f] mx-auto mb-2" />
                    <p className="text-[11px] font-medium text-[#52796f] leading-tight">
                      Drag &amp; drop or tap to upload
                    </p>
                  </>
                )}
              </div>
            )}

            {hasVideo && status === 'uploading' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Right side: controls */}
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="file"
              accept="video/mp4,video/webm"
              onChange={onFileChange}
              className="hidden"
            />

            {status === 'uploading' && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-medium text-[#52796f] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Uploading…
                  </span>
                  <span className="tabular-nums">{progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#e0efe2] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#52b788] to-[#2d6a4f] transition-[width] duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="mb-4 flex items-center gap-2 text-[#166534] bg-[#dcfce7] border border-[#86efac] rounded-xl px-3 py-2 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                {message}
              </div>
            )}

            {status === 'error' && message && (
              <div className="mb-4 flex items-center gap-2 text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {message}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={status === 'uploading'}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#2d6a4f] text-white text-sm font-semibold rounded-xl hover:bg-[#1a4d3a] transition-colors disabled:opacity-50"
              >
                {hasVideo ? <RefreshCw className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
                {hasVideo ? 'Replace video' : 'Upload video'}
              </button>

              {hasVideo &&
                (confirmDelete ? (
                  <div className="inline-flex items-center gap-2 bg-[#fef2f2] border border-[#fecaca] rounded-xl pl-3 pr-2 py-1.5">
                    <span className="text-xs font-medium text-[#991b1b]">Delete video?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#dc2626] rounded-lg hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting…' : 'Yes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#52796f] bg-white rounded-lg border border-[#fecaca] hover:bg-[#f0f7f0] transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    disabled={status === 'uploading'}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#fef2f2] text-[#dc2626] text-sm font-semibold rounded-xl border border-[#fecaca] hover:bg-[#fee2e2] transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                ))}
            </div>

            <p className="text-xs text-[#95d5b2] mt-3 flex items-center gap-1.5">
              <Play className="w-3 h-3" />
              MP4 or WebM · max 20 MB · vertical (9:16) recommended
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
