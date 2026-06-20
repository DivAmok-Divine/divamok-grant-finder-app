import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'primary' | 'danger'
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmBtnCls = variant === 'danger'
    ? 'bg-red-600 text-white hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.26)]'
    : 'bg-brand text-white hover:bg-brand-press shadow-[0_4px_12px_rgba(5,150,105,0.26)]'

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09110B]/40 p-4 backdrop-blur-[2px] transition-opacity">
      <div 
        className="w-full max-w-md scale-100 rounded-xl border border-line bg-canvas p-6 shadow-2xl transition-transform"
        role="dialog"
        aria-modal="true"
      >
        <h3 className="mb-2 text-xl font-extrabold text-ink">{title}</h3>
        <p className="mb-8 text-[14.5px] leading-relaxed text-muted">{description}</p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md bg-surface px-5 py-2.5 text-[14.5px] font-semibold text-ink border border-line hover:bg-soft focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-md px-5 py-2.5 text-[14.5px] font-bold focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-1 ${confirmBtnCls}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
