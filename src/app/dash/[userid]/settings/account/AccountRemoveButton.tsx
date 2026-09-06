'use client'
import Modal from '@annatarhe/lake-ui/modal'
import { useState } from 'react'
export default function AccountRemoveButton() {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('')
  async function remove() {
    setBusy(true)
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.msg || 'Deletion could not be scheduled')
      setMessage(result.data.message)
      setOpen(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Please try again.')
      setBusy(false)
    }
  }
  return (
    <>
      <button
        disabled={busy}
        onClick={() => setOpen(true)}
        className="rounded-lg bg-red-600 px-5 py-3 text-white"
      >
        Delete ClippingKK account
      </button>
      <output className="block">{message}</output>
      {busy && message && <a href="/">Return home</a>}
      <Modal
        isOpen={open}
        onClose={() => {
          if (!busy) setOpen(false)
        }}
        title="Delete ClippingKK account?"
      >
        <div className="space-y-4 p-6">
          <p>
            Your clippings and ClippingKK profile will be permanently deleted.
            ClippingKK subscriptions will be cancelled. Your Gate identity and
            other products are preserved.
          </p>
          <button
            disabled={busy}
            onClick={remove}
            className="rounded-lg bg-red-600 px-5 py-3 text-white"
          >
            {busy ? 'Scheduling…' : 'Permanently delete ClippingKK data'}
          </button>
        </div>
      </Modal>
    </>
  )
}
