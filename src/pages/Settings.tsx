import { useEffect, useRef, useState } from 'react'
import { Camera, Check, RotateCcw, Save } from 'lucide-react'
import { avatarPresets } from '../config/profile'
import { PageEnter } from '../components/PageEnter'
import { UserAvatar } from '../components/UserAvatar'
import { Button, Field, Input, PageHeader, Panel } from '../components/ui'
import { useStore } from '../store/useStore'

export function Settings() {
  const profile = useStore((s) => s.profile)
  const updateProfile = useStore((s) => s.updateProfile)
  const resetProfileAvatar = useStore((s) => s.resetProfileAvatar)

  const [name, setName] = useState(profile.name)
  const [shortName, setShortName] = useState(profile.shortName)
  const [role, setRole] = useState(profile.role)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(profile.name)
    setShortName(profile.shortName)
    setRole(profile.role)
  }, [profile.name, profile.shortName, profile.role])

  const syncFromStore = () => {
    setName(profile.name)
    setShortName(profile.shortName)
    setRole(profile.role)
  }

  const isPresetSelected = (src: string) =>
    profile.avatarSrc === src || profile.avatarSrc.split('?')[0] === src.split('?')[0]

  return (
    <PageEnter className="pt-3">
      <PageHeader eyebrow="Account" title="Profile settings" />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Panel className="flex flex-col items-center text-center !p-6">
          <div className="mb-4 rounded-[1.5rem] bg-gradient-to-b from-[#1e2d4a] to-[#152033] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
            <UserAvatar size={120} float />
          </div>
          <p className="font-display text-lg font-semibold text-ink">{profile.name}</p>
          <p className="text-sm text-muted">{profile.role}</p>

          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                if (typeof reader.result === 'string') {
                  void updateProfile({ avatarSrc: reader.result })
                }
              }
              reader.readAsDataURL(file)
              e.target.value = ''
            }}
          />

          <div className="mt-5 flex w-full flex-col gap-2">
            <Button
              variant="soft"
              className="w-full"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={16} /> Upload photo
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => void resetProfileAvatar()}
            >
              <RotateCcw size={16} /> Reset photo
            </Button>
          </div>
        </Panel>

        <div className="space-y-6">
          

          <Panel>
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">Details</h2>
            <div className="space-y-3">
              <Field label="Display name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Team Lead"
                />
              </Field>
              <Field label="Short name (greeting)">
                <Input
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  placeholder="Lead"
                />
              </Field>
              <Field label="Role">
                <Input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Lead desk"
                />
              </Field>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  onClick={async () => {
                    await updateProfile({
                      name: name.trim() || profile.name,
                      shortName: shortName.trim() || profile.shortName,
                      role: role.trim() || profile.role,
                    })
                    setSaved(true)
                    window.setTimeout(() => setSaved(false), 1800)
                  }}
                >
                  <Save size={16} /> Save profile
                </Button>
                <Button variant="ghost" onClick={syncFromStore}>
                  Discard
                </Button>
                {saved ? (
                  <span className="text-sm font-medium text-accent-deep">Saved</span>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink">Choose avatar</h2>
            <p className="mb-4 text-sm text-muted">
              Pick a Memoji, upload your own, or reset to the default.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {avatarPresets.map((preset) => {
                const active = isPresetSelected(preset.src)
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => void updateProfile({ avatarSrc: preset.src })}
                    className={`group relative flex flex-col items-center rounded-2xl p-2.5 transition ${
                      active
                        ? 'bg-gradient-to-br from-white to-[#e8eef8] shadow-[8px_10px_20px_rgba(120,140,170,0.28),-3px_-3px_10px_rgba(255,255,255,0.9),inset_0_1px_0_rgba(255,255,255,0.95)] ring-2 ring-accent/40'
                        : 'bg-canvas-deep/40 shadow-[inset_3px_3px_8px_rgba(163,177,198,0.22),inset_-2px_-2px_6px_rgba(255,255,255,0.7)] hover:bg-white/70'
                    }`}
                    aria-label={`Use ${preset.label} avatar`}
                    aria-pressed={active}
                  >
                    <span className="flex h-16 w-16 items-center justify-center sm:h-[4.5rem] sm:w-[4.5rem]">
                      <img
                        src={preset.src}
                        alt=""
                        className="h-full w-full object-contain object-bottom drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]"
                        draggable={false}
                      />
                    </span>
                    <span className="mt-1.5 text-[10px] font-semibold text-muted">{preset.label}</span>
                    {active ? (
                      <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white shadow-md">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>
      </div>
    </PageEnter>
  )
}
