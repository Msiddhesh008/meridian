import { useEffect, type ReactNode } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui'

/** Opens IndexedDB and blocks UI until local data is ready. */
export function DbBoot({ children }: { children: ReactNode }) {
  const ready = useStore((s) => s.ready)
  const error = useStore((s) => s.error)
  const init = useStore((s) => s.init)

  useEffect(() => {
    void init()
  }, [init])

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="neu-card max-w-md p-8 text-center">
          <p className="font-display text-xl font-semibold text-ink">Local database error</p>
          <p className="mt-2 text-sm text-muted">{error}</p>
          <Button className="mt-5" onClick={() => void init()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="neu-card px-10 py-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar font-display text-lg font-bold text-white shadow-[8px_10px_20px_rgba(90,110,150,0.3)]">
            M
          </div>
          <p className="font-display text-lg font-semibold tracking-tight text-ink">Meridian</p>
          <p className="mt-2 text-sm text-muted">Opening local database…</p>
        </div>
      </div>
    )
  }

  return children
}
