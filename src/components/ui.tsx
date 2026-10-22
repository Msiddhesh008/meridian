import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 lg:mb-5">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted lg:hidden">
            {eyebrow}
          </p>
        ) : null}
        {/* Desktop title lives in the top bar; keep mobile title */}
        <h1 className="font-display text-[1.75rem] font-semibold tracking-tight text-ink lg:hidden">
          {title}
        </h1>
      </div>
      {action}
    </header>
  )
}

export function Panel({
  children,
  className = '',
  tone = 'default',
}: {
  children: ReactNode
  className?: string
  tone?: 'default' | 'well' | 'mint' | 'sky' | 'lavender' | 'peach'
}) {
  const tones = {
    default: 'neu-card',
    well: 'neu-well',
    mint: 'soft-pastel bg-gradient-to-br from-[#e8f6f0] to-[#d5eee4]',
    sky: 'soft-pastel bg-gradient-to-br from-[#e6f0fb] to-[#d5e5f7]',
    lavender: 'soft-pastel bg-gradient-to-br from-[#efeafc] to-[#e2daf7]',
    peach: 'soft-pastel bg-gradient-to-br from-[#f8ebe4] to-[#f2ddd2]',
  }
  return (
    <section className={`p-5 ${tones[tone]} ${className}`}>
      {children}
    </section>
  )
}

export function PanelTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-display text-base font-semibold tracking-tight text-ink">{children}</h2>
      {aside}
    </div>
  )
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
  size?: 'md' | 'sm' | 'icon'
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold transition disabled:cursor-not-allowed disabled:opacity-40'
  const sizes = {
    md: 'rounded-2xl px-5 py-2.5 text-sm',
    sm: 'rounded-xl px-3.5 py-1.5 text-sm',
    icon: 'h-11 w-11 rounded-full',
  }
  const variants = {
    primary:
      'neu-btn bg-gradient-to-br from-ink to-sidebar-soft text-white',
    secondary:
      'neu-btn bg-gradient-to-br from-white to-surface text-ink',
    soft:
      'neu-btn bg-gradient-to-br from-accent to-accent-deep text-white',
    ghost: 'rounded-2xl text-muted hover:bg-white/50 hover:text-ink',
    danger: 'neu-btn bg-gradient-to-br from-danger-soft to-[#f0d0d0] text-danger',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

const fieldClass =
  'w-full rounded-2xl border-0 bg-canvas-deep/70 px-3.5 py-2.5 text-sm text-ink outline-none shadow-[inset_4px_4px_10px_rgba(163,177,198,0.28),inset_-3px_-3px_8px_rgba(255,255,255,0.75)] transition placeholder:text-faint focus:ring-2 focus:ring-accent/25'

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={`${fieldClass} ${props.className ?? ''}`} />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${fieldClass} ${props.className ?? ''}`} />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={`resize-none ${fieldClass} ${props.className ?? ''}`} />
  )
}

export function StatusPill({
  tone,
  children,
}: {
  tone: 'neutral' | 'good' | 'warn' | 'danger'
  children: ReactNode
}) {
  const tones = {
    neutral: 'bg-white/70 text-muted shadow-sm',
    good: 'bg-accent-soft text-accent-deep',
    warn: 'bg-warn-soft text-warn',
    danger: 'bg-danger-soft text-danger',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Avatar({ initials, size = 'md' }: { initials: string; size?: 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'h-14 w-14 text-sm' : 'h-10 w-10 text-xs'
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#cfd9ea] to-[#aebcd4] font-bold tracking-wide text-ink shadow-[4px_4px_10px_rgba(140,155,180,0.35),-3px_-3px_8px_rgba(255,255,255,0.8)] ${dim}`}
    >
      {initials}
    </span>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted">{children}</p>
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  )
}

export function MetricCard({
  icon,
  label,
  value,
  hint,
  tone = 'mint',
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone?: 'mint' | 'sky' | 'lavender' | 'peach'
}) {
  return (
    <Panel tone={tone} className="!rounded-[1.35rem] !p-4">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/55 text-ink shadow-[4px_4px_10px_rgba(140,155,180,0.2),-3px_-3px_8px_rgba(255,255,255,0.7)]">
        {icon}
      </div>
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-ink/55">{hint}</p> : null}
    </Panel>
  )
}
