"use client";

export default function VideoPlaceholder({
  label,
  duration,
  videoId,
}: {
  label: string;
  duration: string;
  videoId?: string;
}) {
  if (videoId) {
    return (
      <div className="rounded-xl overflow-hidden my-6 border border-zinc-800">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
        <div className="px-4 py-3 bg-zinc-900 flex items-center justify-between">
          <span className="text-zinc-300 text-sm font-medium">{label}</span>
          <span className="text-zinc-500 text-xs">{duration}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden my-6">
      <div className="aspect-video flex flex-col items-center justify-center gap-3 bg-zinc-950 relative">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-amber-400 translate-x-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <span className="text-zinc-500 text-sm">Video coming soon</span>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-zinc-300 text-sm font-medium">{label}</span>
        <span className="text-zinc-500 text-xs">{duration}</span>
      </div>
    </div>
  );
}
