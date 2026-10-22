/** Default profile — overridden by Settings (persisted in IndexedDB). */
export const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export type UserProfile = {
  name: string
  shortName: string
  role: string
  /** Absolute or data URL */
  avatarSrc: string
  avatarFallback: string
}

export type AvatarPreset = {
  id: string
  label: string
  src: string
}

/** Preset Memoji options shown in Settings. */
export const avatarPresets: AvatarPreset[] = [
  { id: 'classic', label: 'Classic', src: asset('avatars/classic.png') },
  { id: 'wave', label: 'Wave', src: asset('avatars/wave.png') },
  { id: 'peace', label: 'Peace', src: asset('avatars/peace.png') },
  { id: 'wink', label: 'Wink', src: asset('avatars/wink.png') },
  { id: 'laugh', label: 'Laugh', src: asset('avatars/laugh.png') },
  { id: 'hearts', label: 'Hearts', src: asset('avatars/hearts.png') },
  { id: 'thinking', label: 'Thinking', src: asset('avatars/thinking.png') },
  { id: 'surprised', label: 'Surprised', src: asset('avatars/surprised.png') },
  { id: 'cool', label: 'Cool', src: asset('avatars/cool.png') },
  { id: 'call-me', label: 'Call me', src: asset('avatars/call-me.png') },
  { id: 'arms-crossed', label: 'Focused', src: asset('avatars/arms-crossed.png') },
  { id: 'celebrate', label: 'Celebrate', src: asset('avatars/celebrate.png') },
  { id: 'sleep', label: 'Sleep', src: asset('avatars/sleep.png') },
]

export const defaultProfile: UserProfile = {
  name: 'Team Lead',
  shortName: 'Lead',
  role: 'Lead desk',
  avatarSrc: avatarPresets[0].src,
  avatarFallback: asset('avatar.svg'),
}

/** @deprecated Prefer useStore profile — kept for static fallbacks. */
export const profile = defaultProfile
