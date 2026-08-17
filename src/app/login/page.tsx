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

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 rounded-lg border bg-muted/40 p-3">
            <p className="mb-1.5 text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Dev Credentials
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-medium text-foreground">Admin:</span> admin@sanaathrumylens.co.ke / sanaa2025</p>
              <p><span className="font-medium text-foreground">Editor:</span> editor@sanaathrumylens.co.ke / editor2025</p>
            </div>
          </div>
        )}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const form = document.getElementById('login-form');
              const errorEl = document.getElementById('error-msg');
              const btn = document.getElementById('submit-btn');
              const emailEl = document.getElementById('email');
              const pw = document.getElementById('password');

              form.addEventListener('submit', async (e) => {
                e.preventDefault();
                btn.textContent = 'Signing in...';
                btn.disabled = true;
                errorEl.classList.add('hidden');

                try {
                  const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailEl.value, password: pw.value }),
                  });
                  const data = await res.json();

                  if (!res.ok) {
                    errorEl.textContent = data.error || 'Login failed';
                    errorEl.classList.remove('hidden');
                    btn.textContent = 'Sign In';
                    btn.disabled = false;
                    pw.value = '';
                    pw.focus();
                    return;
                  }

                  let redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
                  // Prevent open redirect: only allow relative paths starting with /
                  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
                    redirect = '/admin';
                  }
                  window.location.href = redirect;
                } catch (err) {
                  errorEl.textContent = 'Network error. Please try again.';
                  errorEl.classList.remove('hidden');
                  btn.textContent = 'Sign In';
                  btn.disabled = false;
                }
              });
            `,
          }}
        />
      </div>
    </div>
  )
}
