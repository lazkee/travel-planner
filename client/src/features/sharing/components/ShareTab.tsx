import { useCallback, useEffect, useMemo, useState } from 'react'
import { getApiErrorMessage } from '../../../api/apiError'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import EmptyState from '../../../components/ui/EmptyState'
import ErrorAlert from '../../../components/ui/ErrorAlert'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  createShare,
  deleteShare,
  getShares,
} from '../api/shares.api'
import type {
  CreateShareRequestDto,
  ShareTokenDto,
} from '../types/share.types'
import ShareAccessBadge from './ShareAccessBadge'
import ShareFormModal from './ShareFormModal'
import ShareQrCode from './ShareQrCode'

type ShareTabProps = {
  planId: number
  readonly?: boolean
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const frontendBaseUrl = (
  import.meta.env.VITE_FRONTEND_URL || window.location.origin
).replace(/\/+$/, '')

function buildShareLink(token: string) {
  return `${frontendBaseUrl}/shared/${encodeURIComponent(token)}`
}

function getShareLink(share: ShareTokenDto) {
  return share.shareUrl.trim() || buildShareLink(share.token)
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? 'Not set' : dateFormatter.format(date)
}

function isShareExpired(share: ShareTokenDto) {
  const expiresAt = new Date(share.expiresAtUtc)

  return Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()
}

function sortShares(a: ShareTokenDto, b: ShareTokenDto) {
  return a.expiresAtUtc.localeCompare(b.expiresAtUtc)
}

function ShareTab({ planId, readonly = false }: ShareTabProps) {
  const [shares, setShares] = useState<ShareTokenDto[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [revokingShare, setRevokingShare] = useState<ShareTokenDto | null>(null)
  const [isRevoking, setIsRevoking] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  const loadShares = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const nextShares = await getShares(planId)
      setShares(nextShares)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [planId])

  useEffect(() => {
    void loadShares()
  }, [loadShares])

  const sortedShares = useMemo(() => [...shares].sort(sortShares), [shares])

  function handleCreateClick() {
    setIsFormModalOpen(true)
  }

  function handleCloseFormModal() {
    setIsFormModalOpen(false)
  }

  async function handleCreateShare(request: CreateShareRequestDto) {
    const createdShare = await createShare(planId, request)
    await loadShares()
    setCopiedToken(null)

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(getShareLink(createdShare))
        setCopiedToken(createdShare.token)
      } catch {
        setCopiedToken(null)
      }
    }
  }

  async function handleCopyLink(share: ShareTokenDto) {
    setError('')

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard is unavailable.')
      }

      await navigator.clipboard.writeText(getShareLink(share))
      setCopiedToken(share.token)
    } catch {
      setError('Unable to copy link. You can select and copy it manually.')
      setCopiedToken(null)
    }
  }

  async function handleConfirmRevoke() {
    if (!revokingShare) {
      return
    }

    setIsRevoking(true)
    setError('')

    try {
      await deleteShare(planId, revokingShare.token)
      setRevokingShare(null)
      setCopiedToken(null)
      await loadShares()
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
      setRevokingShare(null)
    } finally {
      setIsRevoking(false)
    }
  }

  return (
    <section className="grid gap-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="m-0 text-xl font-bold text-slate-900">Share trip</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Create temporary links for people who need access to this trip.
          </p>
        </div>

        {!readonly ? (
          <Button
            className="w-full sm:w-auto"
            onClick={handleCreateClick}
            variant="primary"
          >
            Create share link
          </Button>
        ) : null}
      </header>

      {error ? <ErrorAlert message={error} /> : null}

      {isLoading ? <LoadingSpinner label="Loading share links..." /> : null}

      {!isLoading && !error && shares.length === 0 ? (
        <EmptyState
          action={
            !readonly ? (
              <Button onClick={handleCreateClick} variant="primary">
                Create share link
              </Button>
            ) : null
          }
          description="Create a view or edit link to share this trip with someone else."
          title="No share links yet"
        />
      ) : null}

      {!isLoading && sortedShares.length > 0 ? (
        <div className="grid gap-3">
          {sortedShares.map((share) => {
            const shareLink = getShareLink(share)
            const isExpired = isShareExpired(share)

            return (
              <Card className="grid gap-4 p-4" key={share.token}>
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
                          <span
                            className={[
                              'inline-flex rounded-full px-2.5 py-1 text-xs font-extrabold ring-1',
                              isExpired
                                ? 'bg-slate-100 text-slate-500 ring-slate-200'
                                : 'bg-emerald-50 text-emerald-700 ring-emerald-100',
                            ].join(' ')}
                          >
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <p className="m-0 text-sm text-slate-500">
                          Expires {formatDate(share.expiresAtUtc)}
                        </p>
                      </div>

                      {!readonly ? (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            onClick={() => void handleCopyLink(share)}
                            variant="primary"
                          >
                            {copiedToken === share.token
                              ? 'Copied'
                              : 'Copy link'}
                          </Button>
                          <Button
                            onClick={() => setRevokingShare(share)}
                            variant="danger"
                          >
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
          })}
        </div>
      ) : null}

      {!isLoading && error && shares.length === 0 ? (
        <div>
          <Button onClick={loadShares} variant="secondary">
            Try again
          </Button>
        </div>
      ) : null}

      <ShareFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleCreateShare}
      />

      <ConfirmDialog
        confirmLabel="Revoke link"
        isOpen={Boolean(revokingShare)}
        isSubmitting={isRevoking}
        message="Revoke this share link? Anyone using it will lose access."
        onCancel={() => setRevokingShare(null)}
        onConfirm={handleConfirmRevoke}
        title="Revoke share link"
      />
    </section>
  )
}

export default ShareTab
