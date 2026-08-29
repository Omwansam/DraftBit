import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import Button from '../components/ui/Button'
import ThemeToggle from '../components/ui/ThemeToggle'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAuthenticated, status, demoMode, demoPassword } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { email: '', password: '', remember: true } })

  if (status !== 'loading' && isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? '/'} replace />
  }

  const onSubmit = async (values) => {
    setFormError(null)
    try {
      await login(values)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setFormError(err.message || 'Could not sign in. Please try again.')
    }
  }

  const fillDemo = () => {
    setValue('email', 'alex@draftbit.com')
    setValue('password', demoPassword)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Brand panel — hidden on small screens where it would just push the
          form below the fold. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--secondary), transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
            D
          </span>
          <span className="font-display text-lg font-bold text-foreground">DraftBit</span>
        </div>

        <div className="relative max-w-lg">
          <p className="eyebrow mb-5">Admin console</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground xl:text-5xl">
            Everything the site says,{' '}
            <span className="text-gradient">managed in one place.</span>
          </h1>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted-foreground">
            Projects, insights, open roles, testimonials and every enquiry that
            comes through the contact form — edited here, live on the site.
          </p>
        </div>

        <p className="relative text-xs text-subtle-foreground">
          © {new Date().getFullYear()} DraftBit · Nairobi, Kenya
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <div className="absolute right-5 top-5">
          <ThemeToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground">
              D
            </span>
            <span className="font-display text-lg font-bold text-foreground">DraftBit Admin</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground">Sign in</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Use your DraftBit team account to continue.
          </p>

          {formError && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2.5 rounded-lg border border-critical/35 bg-critical/10 px-3.5 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-critical" aria-hidden="true" />
              <p className="text-[0.8125rem] text-critical">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-[0.8125rem] font-medium text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email) || undefined}
                  className={`h-11 w-full rounded-lg border bg-input pl-10 pr-3 text-sm text-foreground transition-colors placeholder:text-subtle-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 ${
                    errors.email ? 'border-critical' : 'border-border focus:border-primary'
                  }`}
                  placeholder="you@draftbitlabs.tech"
                  {...register('email', {
                    required: 'Enter your email address',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-critical">{errors.email.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[0.8125rem] font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle-foreground"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password) || undefined}
                  className={`h-11 w-full rounded-lg border bg-input pl-10 pr-11 text-sm text-foreground transition-colors placeholder:text-subtle-foreground focus:outline-none focus:ring-2 focus:ring-primary/25 ${
                    errors.password ? 'border-critical' : 'border-border focus:border-primary'
                  }`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Enter your password' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-foreground/8 hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-critical">{errors.password.message}</p>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-[0.8125rem] text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border-strong bg-input accent-[var(--primary)]"
                {...register('remember')}
              />
              Keep me signed in
            </label>

            <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 w-full">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>

          {demoMode && (
            <div className="mt-6 rounded-lg border border-border bg-surface-2 p-4">
              <p className="text-[0.8125rem] font-medium text-foreground">Demo mode</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                No <code className="text-foreground">VITE_API_URL</code> is configured, so the
                console runs on seeded data saved to this browser. Sign in with any team
                address and the password <code className="text-foreground">{demoPassword}</code>.
              </p>
              <button
                type="button"
                onClick={fillDemo}
                className="mt-2.5 text-[0.8125rem] font-medium text-primary hover:underline"
              >
                Fill demo credentials
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
