import { Check, Plus } from '@phosphor-icons/react'
import { useState } from 'react'
import { Button } from '../../../components/ui/Button'
import { DocumentReferenceField } from '../../../components/ui/DocumentReferenceField'
import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import type { DocumentoReferencia, PrestacaoEspecie, PrestacaoStatus } from '../../../data/database.types'
import { prestacaoEspecieOptions, prestacaoStatusOptions } from '../../../domains/options'
import { prestacaoService } from '../../../services/prestacaoService'

export function PrestacaoForm({ instrumentoId, onCreated }: { instrumentoId: string; onCreated: () => void }) {
  const [status, setStatus] = useState<PrestacaoStatus>('Em elaboração')
  const [especie, setEspecie] = useState<PrestacaoEspecie>('Parcial')
  const [periodo, setPeriodo] = useState('')
  const [relatorioSei, setRelatorioSei] = useState('')
  const [uploadRelatorio, setUploadRelatorio] = useState<DocumentoReferencia>({ nome: '', seiNumero: '' })
  const [documentoEnvioSei, setDocumentoEnvioSei] = useState('')
  const [complementacao, setComplementacao] = useState('')
  const [documentoRespostaSei, setDocumentoRespostaSei] = useState('')
  const [created, setCreated] = useState(false)

  function resetForm() {
    setStatus('Em elaboração')
    setEspecie('Parcial')
    setPeriodo('')
    setRelatorioSei('')
    setUploadRelatorio({ nome: '', seiNumero: '' })
    setDocumentoEnvioSei('')
    setComplementacao('')
    setDocumentoRespostaSei('')
  }

  function createPrestacao() {
    if (!periodo.trim()) return
    prestacaoService.createPrestacao({
      instrumentoId,
      status,
      especie,
      periodo,
      relatorioSei,
      uploadRelatorio,
      documentoEnvioSei,
      complementacao,
      documentoRespostaSei,
    })
    setCreated(true)
    onCreated()
    resetForm()
  }

  return (
    <FormSection title="Nova prestação">
      <div className="grid gap-4">
        <Select label="Status" options={prestacaoStatusOptions} value={status} onChange={(event) => setStatus(event.target.value as PrestacaoStatus)} />
        <Select label="Espécie" options={prestacaoEspecieOptions} value={especie} onChange={(event) => setEspecie(event.target.value as PrestacaoEspecie)} />
        <Input label="Período" value={periodo} onChange={(event) => setPeriodo(event.target.value)} />
        <Input label="Relatório SEI nº" value={relatorioSei} onChange={(event) => setRelatorioSei(event.target.value)} />
        <DocumentReferenceField label="Upload do Relatório" value={uploadRelatorio} onChange={setUploadRelatorio} />
        <Input label="Documento de envio SEI nº" value={documentoEnvioSei} onChange={(event) => setDocumentoEnvioSei(event.target.value)} />
        <Textarea label="Complementação" value={complementacao} onChange={(event) => setComplementacao(event.target.value)} />
        <Input label="Documento resposta SEI nº" value={documentoRespostaSei} onChange={(event) => setDocumentoRespostaSei(event.target.value)} />
        {created && (
          <p className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            <Check size={16} weight="bold" />
            Prestação criada localmente e adicionada à lista.
          </p>
        )}
        <Button disabled={!periodo.trim()} icon={<Plus size={17} weight="bold" />} onClick={createPrestacao}>
          Registrar prestação
        </Button>
      </div>
    </FormSection>
  )
}
