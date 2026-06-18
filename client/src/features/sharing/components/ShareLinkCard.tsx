import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import { formatDateTime } from '../../../utils/format'
import type { ShareTokenDto } from '../types/share.types'
import { getShareLink } from '../utils/shareLink'
import ShareAccessBadge from './ShareAccessBadge'
import ShareQrCode from './ShareQrCode'
import ShareStatusBadge from './ShareStatusBadge'

type ShareLinkCardProps = {
  copied: boolean
  readonly: boolean
  share: ShareTokenDto
  onCopy: () => void
  onRevoke: () => void
}

function isShareExpired(share: ShareTokenDto) {
  const expiresAt = new Date(share.expiresAtUtc)

  return Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()
}

function ShareLinkCard({
  copied,
  readonly,
  share,
  onCopy,
  onRevoke,
}: ShareLinkCardProps) {
  const shareLink = getShareLink(share)
  const isExpired = isShareExpired(share)

  return (
    <Card className="grid gap-4 p-4">
      <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
        {share.token.trim() ? (
          <div className="lg:pt-1">
            <ShareQrCode qrCodeDataUrl={share.qrCodeDataUrl} />
          </div>
        ) : null}

        <div className="grid min-w-0 gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="grid gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <ShareAccessBadge accessLevel={share.accessLevel} />
                <ShareStatusBadge isExpired={isExpired} />
              </div>
              <p className="m-0 text-sm text-slate-500">
                Expires {formatDateTime(share.expiresAtUtc)}
              </p>
            </div>

            {!readonly ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={onCopy} variant="primary">
                  {copied ? 'Copied' : 'Copy link'}
                </Button>
                <Button onClick={onRevoke} variant="danger">
                  Revoke
                </Button>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <p className="m-0 break-all font-mono text-xs text-slate-600">
              {shareLink}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ShareLinkCard
