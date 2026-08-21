import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return <LoginClient />
}

function LoginClient() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <img src="/icon.png" alt="Sanaa" className="mb-4 h-16 w-16 rounded-xl" />
          <h1 className="font-serif text-2xl font-bold">Sanaa CMS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage content
          </p>
        </div>

        {/* Step 1: Email + Password */}
        <form id="login-form" className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@sanaathrumylens.co.ke"
              autoComplete="email"
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              autoComplete="current-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div id="error-msg" className="hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          </div>

          <button
            type="submit"
            id="submit-btn"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Sign In
          </button>
        </form>

        {/* Step 2: 2FA Code (hidden by default) */}
        <form id="twofa-form" className="hidden space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/60 dark:bg-blue-950/20">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              A 6-digit code was sent to <strong id="twofa-email"></strong>. Check your email.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Verification Code
            </label>
            <input
              id="twofa-code"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="000000"
              autoComplete="one-time-code"
              autoFocus
              className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-center text-xl font-mono tracking-[0.3em] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div id="twofa-error" className="hidden rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          </div>

          <button
            type="submit"
            id="twofa-btn"
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Verify & Sign In
          </button>

          <button
            type="button"
            id="twofa-back"
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to login
          </button>
        </form>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg border bg-muted/40 p-3">
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dev Credentials
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Admin:</span> admin@sanaathrumylens.co.ke / sanaa2025</p>
              <p><span className="font-medium text-foreground">Editor:</span> (create via admin panel)</p>
            </div>
          </div>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const loginForm = document.getElementById('login-form');
              const twoFaForm = document.getElementById('twofa-form');
              const errorEl = document.getElementById('error-msg');
              const twoFaError = document.getElementById('twofa-error');
              const btn = document.getElementById('submit-btn');
              const twoFaBtn = document.getElementById('twofa-btn');
              const emailEl = document.getElementById('email');
              const pwEl = document.getElementById('password');
              const codeEl = document.getElementById('twofa-code');
              const twoFaEmailEl = document.getElementById('twofa-email');
              const backBtn = document.getElementById('twofa-back');
              let pendingEmail = '';

              function showStep(step) {
                loginForm.classList.toggle('hidden', step === '2fa');
                twoFaForm.classList.toggle('hidden', step !== '2fa');
                errorEl.classList.add('hidden');
                twoFaError.classList.add('hidden');
              }

              loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                btn.textContent = 'Signing in...';
                btn.disabled = true;
                errorEl.classList.add('hidden');

                try {
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailEl.value, password: pwEl.value }),
                  });
                  const data = await res.json();

                  if (!res.ok) {
                    errorEl.textContent = data.error || 'Login failed';
                    errorEl.classList.remove('hidden');
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                    pwEl.value = '';
                    pwEl.focus();
                    return;
                  }

                  if (data.requires2FA) {
                    pendingEmail = emailEl.value.toLowerCase().trim();
                    twoFaEmailEl.textContent = pendingEmail;
                    showStep('2fa');
                    codeEl.value = '';
                    codeEl.focus();
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                    return;
                  }

                  // Admin login — redirect immediately
                  let redirect = data.redirect || new URLSearchParams(window.location.search).get('redirect') || '/admin';
                  if (!redirect.startsWith('/') || redirect.startsWith('//')) redirect = '/admin';
                  window.location.href = redirect;
                } catch (err) {
                  errorEl.textContent = 'Network error. Please try again.';
                  errorEl.classList.remove('hidden');
                  btn.textContent = 'Sign In';
                  btn.disabled = false;
                }
              });

              twoFaForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                twoFaBtn.textContent = 'Verifying...';
                twoFaBtn.disabled = true;
                twoFaError.classList.add('hidden');

                try {
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: pendingEmail, password: pwEl.value, code: codeEl.value, step: 'verify' }),
                  });
                  const data = await res.json();

                  if (!res.ok) {
                    twoFaError.textContent = data.error || 'Verification failed';
                    twoFaError.classList.remove('hidden');
                    codeEl.value = '';
                    codeEl.focus();
                    twoFaBtn.textContent = 'Verify & Sign In';
                    twoFaBtn.disabled = false;
                    return;
                  }

                  let redirect = data.redirect || new URLSearchParams(window.location.search).get('redirect') || '/dashboard';
                  if (!redirect.startsWith('/') || redirect.startsWith('//')) redirect = '/dashboard';
                  window.location.href = redirect;
                } catch (err) {
                  twoFaError.textContent = 'Network error. Please try again.';
                  twoFaError.classList.remove('hidden');
                  twoFaBtn.textContent = 'Verify & Sign In';
                  twoFaBtn.disabled = false;
                }
              });

              backBtn.addEventListener('click', () => {
                showStep('login');
                pwEl.value = '';
                pwEl.focus();
              });

              // Auto-focus code input numeric-only
              codeEl.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
              });
            `,
          }}
        />
      </div>
    </div>
  )
}
