import type { ShareAccessLevel } from '../types/share.types'

type ShareAccessBadgeProps = {
  accessLevel: ShareAccessLevel
}

const accessLevelClassNames: Record<ShareAccessLevel, string> = {
  View: 'bg-blue-50 text-blue-700 ring-blue-100',
  Edit: 'bg-amber-50 text-amber-700 ring-amber-100',
}

function ShareAccessBadge({ accessLevel }: ShareAccessBadgeProps) {
  return (
    <span
      className={[
        'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1',
        accessLevelClassNames[accessLevel],
      ].join(' ')}
    >
      {accessLevel}
    </span>
  )
}

export default ShareAccessBadge
