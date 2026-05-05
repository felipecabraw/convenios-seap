import { useState } from 'react'
import { useAppContext } from '../../../app/appContext'
import { EmptyState } from '../../../components/ui/EmptyState'
import type { Contratacao } from '../../../data/database.types'
import { contratacaoService } from '../../../services/contratacaoService'
import { ContratacaoForm } from './ContratacaoForm'
import { ContratacaoSummary } from './ContratacaoSummary'
import { ContratacoesTable } from './ContratacoesTable'
import type { ContratacaoFormData } from './contratacaoForm.types'

function createEmptyContratacao(instrumentoId: string): ContratacaoFormData {
  return {
    instrumentoId,
    processoSei: '',
    statusProcesso: 'Planejamento',
    transferegovProcesso: 'Não',
    neNumero: '',
    neData: '',
    neValor: 0,
    neFonte: '',
    neSei: '',
    contratoNumero: '',
    contratoSei: '',
    transferegovContrato: 'Não',
    valorUnitarioContratado: 0,
    valorTotalContratado: 0,
    quantidadeContratada: 1,
    enteContratado: '',
    cnpjContratado: '',
    gestor: '',
    portariaGestorSei: '',
    fiscal: '',
    portariaFiscalSei: '',
    notaFiscalNumero: '',
    notaFiscalSei: '',
    informacaoGestorSei: '',
    termoRecebimentoProvisorioSei: '',
    termoRecebimentoDefinitivoSei: '',
    obNumero: '',
    obData: '',
    obValor: 0,
    obFonte: '',
    obSei: '',
    tomboNumero: '',
    guiaTombamentoSei: '',
    fotoSei: '',
    transferegovEntrega: 'Não',
    termoEntregaSei: '',
    relatorioBeneficiados: '',
    localizacao: '',
    unidadeBeneficiada: '',
  }
}

export function ContratacoesTab() {
  const { selectedInstrumentoId } = useAppContext()
  const [version, setVersion] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContratacaoFormData>(() => createEmptyContratacao(selectedInstrumentoId))
  const contratacoes = contratacaoService.listContratacoesByInstrumento(selectedInstrumentoId)

  function resetForm() {
    setEditingId(null)
    setForm(createEmptyContratacao(selectedInstrumentoId))
  }

  function saveContratacao() {
    if (!form.processoSei.trim()) return

    if (editingId) {
      contratacaoService.updateContratacao(editingId, form)
    } else {
      contratacaoService.createContratacao(form)
    }

    setVersion((current) => current + 1)
    resetForm()
  }

  function editContratacao(contratacao: Contratacao) {
    setEditingId(contratacao.id)
    setForm({
      instrumentoId: contratacao.instrumentoId,
      processoSei: contratacao.processoSei,
      statusProcesso: contratacao.statusProcesso,
      transferegovProcesso: contratacao.transferegovProcesso,
      neNumero: contratacao.neNumero,
      neData: contratacao.neData,
      neValor: contratacao.neValor,
      neFonte: contratacao.neFonte,
      neSei: contratacao.neSei,
      contratoNumero: contratacao.contratoNumero,
      contratoSei: contratacao.contratoSei,
      transferegovContrato: contratacao.transferegovContrato,
      valorUnitarioContratado: contratacao.valorUnitarioContratado,
      valorTotalContratado: contratacao.valorTotalContratado,
      quantidadeContratada: contratacao.quantidadeContratada,
      enteContratado: contratacao.enteContratado,
      cnpjContratado: contratacao.cnpjContratado,
      gestor: contratacao.gestor,
      portariaGestorSei: contratacao.portariaGestorSei,
      fiscal: contratacao.fiscal,
      portariaFiscalSei: contratacao.portariaFiscalSei,
      notaFiscalNumero: contratacao.notaFiscalNumero,
      notaFiscalSei: contratacao.notaFiscalSei,
      informacaoGestorSei: contratacao.informacaoGestorSei,
      termoRecebimentoProvisorioSei: contratacao.termoRecebimentoProvisorioSei,
      termoRecebimentoDefinitivoSei: contratacao.termoRecebimentoDefinitivoSei,
      obNumero: contratacao.obNumero,
      obData: contratacao.obData,
      obValor: contratacao.obValor,
      obFonte: contratacao.obFonte,
      obSei: contratacao.obSei,
      tomboNumero: contratacao.tomboNumero,
      guiaTombamentoSei: contratacao.guiaTombamentoSei,
      fotoSei: contratacao.fotoSei,
      transferegovEntrega: contratacao.transferegovEntrega,
      termoEntregaSei: contratacao.termoEntregaSei,
      relatorioBeneficiados: contratacao.relatorioBeneficiados,
      localizacao: contratacao.localizacao,
      unidadeBeneficiada: contratacao.unidadeBeneficiada,
    })
  }

  function deleteContratacao(id: string) {
    contratacaoService.deleteContratacao(id)
    setVersion((current) => current + 1)
    if (editingId === id) resetForm()
  }

  void version

  return (
    <div className="grid gap-5">
      <ContratacaoSummary contratacoes={contratacoes} />
      <ContratacaoForm editingId={editingId} form={form} onCancel={resetForm} onChange={setForm} onSave={saveContratacao} />
      {contratacoes.length === 0 ? (
        <EmptyState title="Nenhuma contratação cadastrada" description="Registre processos, empenhos, contratos, notas fiscais, recebimento, pagamento, patrimônio e entrega." />
      ) : (
        <ContratacoesTable contratacoes={contratacoes} onDelete={deleteContratacao} onEdit={editContratacao} />
      )}
    </div>
  )
}
