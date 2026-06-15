type ShareQrCodeProps = {
  qrCodeDataUrl: string
}

function getQrCodeSource(qrCodeDataUrl: string) {
  const trimmedValue = qrCodeDataUrl.trim()

  if (!trimmedValue) {
    return ''
  }

  return trimmedValue.startsWith('data:image')
    ? trimmedValue
    : `data:image/png;base64,${trimmedValue}`
}

function ShareQrCode({ qrCodeDataUrl }: ShareQrCodeProps) {
  const qrCodeSource = getQrCodeSource(qrCodeDataUrl)

  if (!qrCodeSource) {
    return (
      <div className="grid h-36 w-36 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-xs font-semibold text-slate-500">
        QR code unavailable.
      </div>
    )
  }

  return (
    <img
      alt="Share link QR code"
      className="h-36 w-36 rounded-lg border border-slate-200 bg-white p-2"
      src={qrCodeSource}
    />
  )
}

export default ShareQrCode
