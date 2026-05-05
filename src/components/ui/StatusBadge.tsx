export function StatusBadge({ status }: { status: string }) {
  const tone = status.includes('Aprov') || status.includes('Vigente') || status.includes('execução')
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : status.includes('Dilig') || status.includes('pend') || status.includes('Cláusula')
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <span className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>
      {status}
    </span>
  )
}
