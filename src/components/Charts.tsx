import { formatDuration } from '../lib/time'

export function SoftBarChart({
  items,
}: {
  items: { label: string; minutes: number }[]
}) {
  const max = Math.max(...items.map((i) => i.minutes), 1)
  const palette = ['#4a9d9c', '#5b8fd9', '#8b7ec8', '#5aa88a', '#d4896c', '#6a8fbf', '#7bb8b0']

  return (
    <div className="neu-well flex h-44 items-end gap-2 px-4 pb-3 pt-6 sm:gap-3">
      {items.map((item, i) => {
        const h = Math.max(8, (item.minutes / max) * 100)
        return (
          <div key={item.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div
              className="w-full max-w-[36px] rounded-t-2xl rounded-b-md shadow-[inset_-2px_-2px_6px_rgba(255,255,255,0.35),4px_6px_12px_rgba(80,100,140,0.2)]"
              style={{
                height: `${h}%`,
                background: `linear-gradient(180deg, ${palette[i % palette.length]} 0%, ${palette[i % palette.length]}cc 100%)`,
              }}
              title={`${item.label}: ${formatDuration(item.minutes)}`}
            />
            <span className="text-[10px] font-semibold text-muted">{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

export function SoftDonut({
  slices,
  centerLabel,
  centerValue,
}: {
  slices: { label: string; value: number; color: string }[]
  centerLabel: string
  centerValue: string
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  const size = 160
  const stroke = 26
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div
          className="absolute inset-3 rounded-full"
          style={{
            boxShadow:
              'inset 6px 6px 14px rgba(163,177,198,0.35), inset -5px -5px 12px rgba(255,255,255,0.85)',
          }}
        />
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#dce3ef"
            strokeWidth={stroke}
          />
          {slices.map((slice) => {
            const len = (slice.value / total) * c
            const dash = `${len} ${c - len}`
            const el = (
              <circle
                key={slice.label}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={slice.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += len
            return el
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{centerLabel}</p>
          <p className="font-display text-xl font-bold text-ink">{centerValue}</p>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              <span className="truncate">{s.label}</span>
            </span>
            <span className="tabular-nums text-muted">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
