type ProgressBarProps = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label = "Progres" }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${value}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-medium tabular-nums">{value}%</span>
    </div>
  );
}
