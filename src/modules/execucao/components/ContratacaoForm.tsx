import { Check, Plus, X } from '@phosphor-icons/react'
import { Button } from '../../../components/ui/Button'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { DateInput } from '../../../components/ui/DateInput'
import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import type { SimNao, StatusProcessoContratacao } from '../../../data/database.types'
import { simNaoOptions, statusProcessoContratacaoOptions } from '../../../domains/options'
import { calcularValorTotal } from '../../../utils/calculations'
import type { ContratacaoFormData } from './contratacaoForm.types'

interface ContratacaoFormProps {
  editingId: string | null
  form: ContratacaoFormData
  onChange: (form: ContratacaoFormData) => void
  onSave: () => void
  onCancel: () => void
}

export function ContratacaoForm({ editingId, form, onChange, onSave, onCancel }: ContratacaoFormProps) {
  const totalCalculado = calcularValorTotal(form.quantidadeContratada, form.valorUnitarioContratado)

  return (
    <FormSection title={editingId ? 'Editar contratação' : 'Nova contratação'}>
      <div className="grid gap-6">
        <div className="grid grid-cols-4 gap-4">
          <Input label="Processo SEI nº" value={form.processoSei} onChange={(event) => onChange({ ...form, processoSei: event.target.value })} />
          <Select label="Status de processo" options={statusProcessoContratacaoOptions} value={form.statusProcesso} onChange={(event) => onChange({ ...form, statusProcesso: event.target.value as StatusProcessoContratacao })} />
          <Select label="Aba transferegov.br? do processo" options={simNaoOptions} value={form.transferegovProcesso} onChange={(event) => onChange({ ...form, transferegovProcesso: event.target.value as SimNao })} />
          <Input label="NE nº" value={form.neNumero} onChange={(event) => onChange({ ...form, neNumero: event.target.value })} />
          <DateInput label="NE Data" value={form.neData} onChange={(value) => onChange({ ...form, neData: value })} />
          <CurrencyInput label="NE Valor" value={form.neValor} onChange={(value) => onChange({ ...form, neValor: value })} />
          <Input label="NE Fonte" value={form.neFonte} onChange={(event) => onChange({ ...form, neFonte: event.target.value })} />
          <Input label="NE SEI nº" value={form.neSei} onChange={(event) => onChange({ ...form, neSei: event.target.value })} />
        </div>

        <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-5">
          <Input label="Contrato nº" value={form.contratoNumero} onChange={(event) => onChange({ ...form, contratoNumero: event.target.value })} />
          <Input label="Contrato SEI nº" value={form.contratoSei} onChange={(event) => onChange({ ...form, contratoSei: event.target.value })} />
          <Select label="Aba transferegov.br? do contrato" options={simNaoOptions} value={form.transferegovContrato} onChange={(event) => onChange({ ...form, transferegovContrato: event.target.value as SimNao })} />
          <CurrencyInput label="Valor Unitário Contratado" value={form.valorUnitarioContratado} onChange={(value) => onChange({ ...form, valorUnitarioContratado: value, valorTotalContratado: calcularValorTotal(form.quantidadeContratada, value) })} />
          <Input label="Quantidade Contratada" min={0} type="number" value={form.quantidadeContratada} onChange={(event) => onChange({ ...form, quantidadeContratada: Number(event.target.value), valorTotalContratado: calcularValorTotal(Number(event.target.value), form.valorUnitarioContratado) })} />
          <CurrencyInput label="Valor Total Contratado" value={form.valorTotalContratado || totalCalculado} onChange={(value) => onChange({ ...form, valorTotalContratado: value })} />
          <Input label="Ente Contratado" value={form.enteContratado} onChange={(event) => onChange({ ...form, enteContratado: event.target.value })} />
          <Input label="CNPJ do Contratado" value={form.cnpjContratado} onChange={(event) => onChange({ ...form, cnpjContratado: event.target.value })} />
          <Input label="Gestor" value={form.gestor} onChange={(event) => onChange({ ...form, gestor: event.target.value })} />
          <Input label="Portaria SEI nº do gestor" value={form.portariaGestorSei} onChange={(event) => onChange({ ...form, portariaGestorSei: event.target.value })} />
          <Input label="Fiscal" value={form.fiscal} onChange={(event) => onChange({ ...form, fiscal: event.target.value })} />
          <Input label="Portaria SEI nº do fiscal" value={form.portariaFiscalSei} onChange={(event) => onChange({ ...form, portariaFiscalSei: event.target.value })} />
        </div>

        <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-5">
          <Input label="Nota Fiscal nº" value={form.notaFiscalNumero} onChange={(event) => onChange({ ...form, notaFiscalNumero: event.target.value })} />
          <Input label="Nota Fiscal SEI nº" value={form.notaFiscalSei} onChange={(event) => onChange({ ...form, notaFiscalSei: event.target.value })} />
          <Input label="Informação do Gestor SEI nº" value={form.informacaoGestorSei} onChange={(event) => onChange({ ...form, informacaoGestorSei: event.target.value })} />
          <Input label="Termo de Recebimento Provisória SEI nº" value={form.termoRecebimentoProvisorioSei} onChange={(event) => onChange({ ...form, termoRecebimentoProvisorioSei: event.target.value })} />
          <Input label="Termo de Recebimento Definitivo SEI nº" value={form.termoRecebimentoDefinitivoSei} onChange={(event) => onChange({ ...form, termoRecebimentoDefinitivoSei: event.target.value })} />
          <Input label="OB nº" value={form.obNumero} onChange={(event) => onChange({ ...form, obNumero: event.target.value })} />
          <DateInput label="OB Data" value={form.obData} onChange={(value) => onChange({ ...form, obData: value })} />
          <CurrencyInput label="OB Valor" value={form.obValor} onChange={(value) => onChange({ ...form, obValor: value })} />
          <Input label="OB Fonte" value={form.obFonte} onChange={(event) => onChange({ ...form, obFonte: event.target.value })} />
          <Input label="OB SEI nº" value={form.obSei} onChange={(event) => onChange({ ...form, obSei: event.target.value })} />
          <Input label="Tombo nº" value={form.tomboNumero} onChange={(event) => onChange({ ...form, tomboNumero: event.target.value })} />
          <Input label="Guia de Tombamento SEI nº" value={form.guiaTombamentoSei} onChange={(event) => onChange({ ...form, guiaTombamentoSei: event.target.value })} />
          <Input label="Foto no SEI nº" value={form.fotoSei} onChange={(event) => onChange({ ...form, fotoSei: event.target.value })} />
          <Select label="Aba transferegov.br? da entrega" options={simNaoOptions} value={form.transferegovEntrega} onChange={(event) => onChange({ ...form, transferegovEntrega: event.target.value as SimNao })} />
          <Input label="Termo de Entrega SEI nº" value={form.termoEntregaSei} onChange={(event) => onChange({ ...form, termoEntregaSei: event.target.value })} />
          <Input label="Unidade Beneficiada" value={form.unidadeBeneficiada} onChange={(event) => onChange({ ...form, unidadeBeneficiada: event.target.value })} />
          <Input label="Localização" value={form.localizacao} onChange={(event) => onChange({ ...form, localizacao: event.target.value })} />
          <div className="col-span-3">
            <Textarea label="Relatório de beneficiados" value={form.relatorioBeneficiados} onChange={(event) => onChange({ ...form, relatorioBeneficiados: event.target.value })} />
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button icon={<X size={17} weight="bold" />} onClick={onCancel} variant="secondary">Limpar</Button>
        <Button disabled={!form.processoSei.trim()} icon={editingId ? <Check size={17} weight="bold" /> : <Plus size={17} weight="bold" />} onClick={onSave}>
          {editingId ? 'Salvar contratação' : 'Adicionar contratação'}
        </Button>
      </div>
    </FormSection>
  )
}
