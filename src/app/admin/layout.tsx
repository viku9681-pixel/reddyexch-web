/**
 * Root admin layout — bare passthrough.
 *
 * Auth check + nav lives in (protected)/layout.tsx which wraps all
 * admin pages except /admin/login.
 *
 * /admin/login is a direct child of this layout (no auth check),
 * which prevents the infinite redirect loop that occurred when
 * the auth layout redirected unauthenticated users to /admin/login,
 * which itself was wrapped by the same auth layout.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
