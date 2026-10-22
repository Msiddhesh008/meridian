import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Check, ChevronDown } from 'lucide-react'

export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SelectProps = {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Soft hint shown when closed and value is empty */
  emptyLabel?: string
  /** Optional leading icon inside the trigger */
  leading?: ReactNode
  'aria-label'?: string
}

/** Custom neumorphic dropdown — reuse anywhere instead of native `<select>`. */
export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled = false,
  className = '',
  emptyLabel,
  leading,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  )

  const enabledIndexes = useMemo(
    () => options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0),
    [options],
  )

  const close = useCallback(() => {
    setOpen(false)
    setHighlight(-1)
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const idx = options.findIndex((o) => o.value === value && !o.disabled)
    setHighlight(idx >= 0 ? idx : (enabledIndexes[0] ?? -1))
  }, [open, options, value, enabledIndexes])

  useEffect(() => {
    if (!open || highlight < 0) return
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [open, highlight])

  const pick = (next: string) => {
    onChange(next)
    close()
  }

  const moveHighlight = (dir: 1 | -1) => {
    if (enabledIndexes.length === 0) return
    const pos = enabledIndexes.indexOf(highlight)
    const nextPos =
      pos < 0
        ? dir === 1
          ? 0
          : enabledIndexes.length - 1
        : (pos + dir + enabledIndexes.length) % enabledIndexes.length
    setHighlight(enabledIndexes[nextPos])
  }

  const onTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!open) setOpen(true)
      else if (e.key === 'ArrowDown') moveHighlight(1)
      else if (highlight >= 0 && !options[highlight]?.disabled) {
        pick(options[highlight].value)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) setOpen(true)
      else moveHighlight(-1)
    } else if (e.key === 'Escape' && open) {
      e.preventDefault()
      close()
    }
  }

  const display =
    selected?.label ??
    (value === '' ? emptyLabel || placeholder : placeholder)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel ?? placeholder}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
        className={`select-trigger flex w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-left text-sm outline-none transition ${
          open ? 'select-trigger-open' : ''
        } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
      >
        {leading ? <span className="shrink-0 text-muted">{leading}</span> : null}
        <span
          className={`min-w-0 flex-1 truncate font-medium ${
            selected || (value === '' && emptyLabel) ? 'text-ink' : 'text-faint'
          }`}
        >
          {display}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted transition duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-activedescendant={highlight >= 0 ? `${listId}-opt-${highlight}` : undefined}
          className="select-menu absolute left-0 right-0 z-40 mt-2 max-h-56 overflow-auto py-1.5"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value
            const isActive = i === highlight
            return (
              <li
                key={`${opt.value}-${i}`}
                id={`${listId}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                aria-disabled={opt.disabled || undefined}
                className={`mx-1.5 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition ${
                  opt.disabled
                    ? 'cursor-not-allowed opacity-40'
                    : isActive
                      ? 'bg-gradient-to-r from-[#e8eef8] to-[#f4f7fc] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]'
                      : 'text-ink-soft hover:bg-white/70'
                } ${isSelected ? 'font-semibold' : 'font-medium'}`}
                onMouseEnter={() => !opt.disabled && setHighlight(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  if (!opt.disabled) pick(opt.value)
                }}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {isSelected ? (
                  <Check size={15} className="shrink-0 text-accent-deep" strokeWidth={2.4} />
                ) : (
                  <span className="w-[15px] shrink-0" />
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
