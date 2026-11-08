import { useState } from 'react'
import { Heart, LockKeyhole, Mail, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const isRegister = mode === 'register'

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!isSupabaseConfigured) {
      setError('Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY di .env.local.')
      return
    }

    setBusy(true)
    try {
      if (isRegister) {
        const { data, error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) throw authError

        if (data.session) {
          navigate('/gallery', { replace: true })
        } else {
          setMessage('Akun berhasil dibuat. Periksa email untuk konfirmasi sebelum masuk.')
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) throw authError
        navigate('/gallery', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#f4e4e3] text-[#b66d76]">
            <Heart size={25} fill="currentColor" strokeWidth={1.5} />
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#b17b7b]">A little place for us</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#302a28]">Our memories,</h1>
          <h2 className="text-3xl font-semibold tracking-tight text-[#b87980]">just for us.</h2>
          <p className="mt-3 text-sm text-[#8b7d78]">A private space to keep your favorite moments.</p>
        </div>

        <div className="rounded-3xl border border-[#eee5df] bg-white p-7 shadow-[0_18px_60px_-35px_rgba(75,45,40,0.25)] sm:p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold">{isRegister ? 'Create your account' : 'Welcome back'}</h3>
            <p className="mt-1 text-sm text-[#968984]">
              {isRegister ? 'Start collecting moments together.' : 'Sign in to revisit your memories.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#5d514d]">Email</span>
              <span className="flex items-center gap-3 rounded-xl border border-[#e9dfda] px-4 focus-within:border-[#c98a90] focus-within:ring-2 focus-within:ring-[#f5e6e6]">
                <Mail size={17} className="text-[#aa9992]" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#b9aeaa]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#5d514d]">Password</span>
              <span className="flex items-center gap-3 rounded-xl border border-[#e9dfda] px-4 focus-within:border-[#c98a90] focus-within:ring-2 focus-within:ring-[#f5e6e6]">
                <LockKeyhole size={17} className="text-[#aa9992]" />
                <input
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#b9aeaa]"
                />
              </span>
            </label>

            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {message && <p role="status" className="rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#bd7b82] px-4 text-sm font-semibold text-white transition hover:bg-[#a96670] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles size={16} />
              {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8b7d78]">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => { setMode(isRegister ? 'login' : 'register'); setError(''); setMessage('') }}
              className="font-semibold text-[#ad6e76] hover:text-[#8d4f59]"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[#b0a39d]">
          <Link to="/" className="hover:text-[#8b7772]">A quiet corner for the two of you.</Link>
        </p>
      </section>
    </main>
  )
}