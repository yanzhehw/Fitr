export function AboutTab() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">About</h2>
        <p className="mt-1 text-sm text-slate-500">Version 0.1.0</p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Fitr</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          AI-powered cross-brand sizing advisor. Fitr helps you buy the right
          size on the first try, even when you're shopping a brand for the
          first time — no measuring tape required.
        </p>
      </section>
    </div>
  );
}
