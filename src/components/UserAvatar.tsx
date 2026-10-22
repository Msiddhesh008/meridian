import { useEffect, useState } from 'react'
import { useStore } from '../store/useStore'

type Props = {
  size?: number
  className?: string
  ring?: boolean
  /** Floating Memoji without circle bg — 3D drop shadow */
  float?: boolean
}

/** Profile photo — uses Settings avatar (or default public asset). */
export function UserAvatar({
  size = 80,
  className = '',
  ring = true,
  float = false,
}: Props) {
  const profile = useStore((s) => s.profile)
  const [src, setSrc] = useState(profile.avatarSrc)

  useEffect(() => {
    setSrc(profile.avatarSrc)
  }, [profile.avatarSrc])

  if (float) {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt={profile.name}
          className="h-full w-full object-contain object-bottom select-none"
          style={{
            filter:
              'drop-shadow(0 14px 18px rgba(0,0,0,0.45)) drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
          }}
          draggable={false}
          onError={() => {
            if (src !== profile.avatarFallback) setSrc(profile.avatarFallback)
          }}
        />
      </span>
    )
  }

  return (
    <span
      className={`relative inline-flex shrink-0 overflow-hidden rounded-full bg-transparent ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: ring
          ? '10px 12px 24px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.2)'
          : undefined,
      }}
    >
      <img
        src={src}
        alt={profile.name}
        className="h-full w-full object-cover object-[center_22%] select-none"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
        draggable={false}
        onError={() => {
          if (src !== profile.avatarFallback) setSrc(profile.avatarFallback)
        }}
      />
    </span>
  )
}
