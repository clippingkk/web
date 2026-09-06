export default function ExternalAccountList(_props: { uid: number }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Sign-in accounts</h3>
      <p>Gate manages your password and connected sign-in providers.</p>
      <a href="/api/auth/account" className="text-indigo-600 underline">
        Manage connected accounts in Gate
      </a>
    </section>
  )
}
