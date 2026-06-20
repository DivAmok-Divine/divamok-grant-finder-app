import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../lib/auth'

export default function Register() {
  const { register } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (username.length < 3) return setError('Username must be at least 3 characters')
    if (password.length < 6) return setError('Password must be at least 6 characters')

    const success = await register(username.trim(), password)
    if (!success) {
      setError('Username already exists or a server error occurred.')
    }
  }

  const inputCls =
    'w-full rounded-md border-[1.5px] border-line bg-canvas px-4 py-3 text-[15.5px] text-ink outline-none placeholder:text-[#A9B4AE] focus:border-brand focus:bg-surface'

  return (
    <main className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-7 flex items-center gap-3">
          <span className="relative inline-block h-[34px] w-[34px] rounded-md bg-brand">
            <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-[2px] bg-white" />
          </span>
          <span className="text-2xl font-extrabold tracking-tight">Grants.DivAmok</span>
        </div>

        <div className="rounded-lg border border-line bg-surface p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight">Create an account</h1>
          <p className="mt-1.5 text-[14.5px] text-muted">
            Join thousands of founders finding the perfect grants.
          </p>

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="mb-2 text-[13px] font-bold">Username</label>
              <input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setError('')
                }}
                placeholder="Choose a user name"
                autoComplete="username"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-2 text-[13px] font-bold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                  }}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-md bg-[#FDECEC] px-3.5 py-2.5 text-[13.5px] font-semibold text-[#C0392B]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-base font-bold text-white shadow-[0_5px_16px_rgba(5,150,105,0.26)] hover:bg-brand-press"
            >
              Sign up
            </button>

            <p className="mt-2 text-center text-[13.5px] text-muted">
              Already have an account? <a href="/login" className="font-bold text-brand hover:underline">Log in</a>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
