import { FileDown } from 'lucide-react'

type DropOverlayProps = {
  label: string
  onClose: () => void
}

function DropOverlay({ label, onClose }: DropOverlayProps) {
  return (
    <div
      data-ui-scale="standard"
      className="bg-lake-overlay animate-in fade-in fixed inset-0 z-50 flex items-center justify-center p-6 duration-150"
      onClick={onClose}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) onClose()
      }}
    >
      <div className="rounded-lake-panel border-lake-accent bg-lake-surface-raised shadow-lake-overlay pointer-events-none flex flex-col items-center gap-3 border-2 border-dashed px-12 py-14 text-center">
        <FileDown
          className="text-lake-accent-text size-10"
          aria-hidden="true"
        />
        <p className="font-reading text-lake-fg text-xl font-semibold">
          {label}
        </p>
        <p className="type-meta">My Clippings.txt</p>
      </div>
    </div>
  )
}

export default DropOverlay
