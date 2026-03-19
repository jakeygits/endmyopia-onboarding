export default function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-2 justify-center py-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 h-2 bg-amber-400"
              : i < current
              ? "w-2 h-2 bg-amber-400/40"
              : "w-2 h-2 bg-zinc-700"
          }`}
        />
      ))}
    </div>
  );
}
