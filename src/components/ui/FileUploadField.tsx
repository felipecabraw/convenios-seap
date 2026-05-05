import { Paperclip } from '@phosphor-icons/react'
import { NEXT_STEP_MESSAGE } from '../../domains/constants'

export function FileUploadField({ label }: { label: string }) {
  return (
    <div className="grid gap-2 text-sm text-slate-700">
      <span className="font-semibold">{label}</span>
      <button
        className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-sm text-slate-500"
        disabled
        title={NEXT_STEP_MESSAGE}
        type="button"
      >
        <Paperclip size={17} weight="bold" />
        Upload será conectado na próxima etapa
      </button>
    </div>
  )
}
