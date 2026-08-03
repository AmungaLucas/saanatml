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
            Enter your password to continue
          </p>
        </div>

        <form id="login-form" className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter password"
              autoFocus
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

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Default password: <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">sanaa2025</code>
        </p>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              const form = document.getElementById('login-form');
              const errorEl = document.getElementById('error-msg');
              const btn = document.getElementById('submit-btn');
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
                    body: JSON.stringify({ password: pw.value }),
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

                  const redirect = new URLSearchParams(window.location.search).get('redirect') || '/admin';
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
