import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import Layout from '../ui/Layout'
import Modal from '../ui/Modal'

export default function Settings() {
  const navigate = useNavigate()
  const { user, changePassword, deleteAccount, logout } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  function updatePassword(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    if (newPassword.length < 6) return setError('New password must be at least 6 characters')
    if (oldPassword === newPassword) return setError('New password cannot be the same as your current password')
    setIsPasswordModalOpen(true)
  }

  async function performPasswordUpdate() {
    setIsPasswordModalOpen(false)
    const success = await changePassword(oldPassword, newPassword)
    if (success) {
      logout()
    } else {
      setError('Failed to update password. Check your current password.')
    }
  }

  function handleDelete() {
    setIsDeleteModalOpen(true)
  }

  async function performDelete() {
    setIsDeleteModalOpen(false)
    const success = await deleteAccount()
    if (!success) {
      setError('Failed to delete account.')
    }
  }

  const inputCls =
    'w-full rounded-md border-[1.5px] border-line bg-canvas px-4 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#A9B4AE] focus:border-brand focus:bg-surface'

  return (
    <Layout as="main" className="pt-8 pb-12">
      <div className="w-full">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-md bg-soft px-4 py-2 text-sm font-bold text-brand-press hover:bg-[#dff0e6]"
        >
          ← Back
        </button>
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight">Account Settings</h1>
        
        <div className="mb-8 flex w-full items-center gap-5 rounded-lg border border-line bg-surface p-8 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-brand text-2xl font-extrabold text-white shadow-sm">
            {user?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-ink">Profile</h2>
            <p className="mt-1 text-[14.5px] text-muted">
              You are logged in as <strong className="font-extrabold text-ink">{user}</strong>
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="w-full rounded-lg border border-line bg-surface p-8 shadow-sm">
            <h2 className="text-xl font-bold">Change Password</h2>
            <form onSubmit={updatePassword} className="mt-6 flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="mb-2 text-[13px] font-bold">Current Password</label>
                <div className="relative w-full max-w-md">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                    aria-label={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="mb-2 text-[13px] font-bold">New Password</label>
                <div className="relative w-full max-w-md">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputCls}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-[13.5px] font-semibold text-[#C0392B]">{error}</p>}
              {successMsg && <p className="text-[13.5px] font-semibold text-brand">{successMsg}</p>}

              <button
                type="submit"
                className="mt-2 inline-flex w-fit items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-[15px] font-bold text-white shadow-[0_5px_16px_rgba(5,150,105,0.26)] hover:bg-brand-press"
              >
                Update Password
              </button>
            </form>
          </div>

          <div className={`w-full rounded-lg border border-red-200 bg-red-50 p-8 transition-opacity duration-300 ${deletePassword.length > 0 ? 'opacity-100' : 'opacity-60 grayscale-[0.3]'}`}>
            <h2 className="text-xl font-bold text-red-700">Danger Zone</h2>
            <p className="mb-6 mt-2 text-[14.5px] text-red-600">Once you delete your account, there is no going back. Please be certain.</p>
            
            <div className="mb-6 flex flex-col">
              <label className="mb-2 text-[13px] font-bold text-red-700">Verify Password to Delete</label>
              <div className="relative w-full max-w-md">
                <input
                  type={showDeletePassword ? "text" : "password"}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-md border-[1.5px] border-red-200 bg-white px-4 py-3 text-[15.5px] text-red-900 outline-none placeholder:text-red-300 focus:border-red-500 focus:bg-white"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword(!showDeletePassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-700 focus:outline-none"
                  aria-label={showDeletePassword ? "Hide password" : "Show password"}
                >
                  {showDeletePassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleDelete}
              disabled={deletePassword.length === 0}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-6 py-2.5 text-[15px] font-bold text-white shadow-[0_5px_16px_rgba(220,38,38,0.26)] transition-colors ${deletePassword.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'cursor-not-allowed bg-red-400'}`}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={performPasswordUpdate}
        title="Update Password"
        description="Updating your password will log you out of your current session. Do you wish to continue?"
        confirmText="Update & Log Out"
        variant="primary"
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={performDelete}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
        confirmText="Delete Account"
        variant="danger"
      />
    </Layout>
  )
}
