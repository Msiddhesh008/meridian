/** Edit these — replace `public/avatar.png` (transparent) to change your photo. */
const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const profile = {
  name: 'Team Lead',
  shortName: 'Lead',
  role: 'Lead desk',
  avatarSrc: asset('avatar.png?v=2'),
  avatarFallback: asset('avatar.svg'),
}
