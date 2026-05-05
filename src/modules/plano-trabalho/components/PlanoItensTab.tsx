import { Check, Plus, X } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAppContext } from '../../../app/appContext'
import { Button } from '../../../components/ui/Button'
import { CurrencyInput } from '../../../components/ui/CurrencyInput'
import { DocumentReferenceField } from '../../../components/ui/DocumentReferenceField'
import { EmptyState } from '../../../components/ui/EmptyState'
import { FormSection } from '../../../components/ui/FormSection'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import type { CategoriaItem, CreateInput, NaturezaAquisicao, NaturezaDespesa, PlanoItem, SimNao, StatusItemPlano } from '../../../data/database.types'
import { categoriaItemOptions, naturezaAquisicaoOptions, naturezaDespesaOptions, simNaoOptions, statusItemPlanoOptions } from '../../../domains/options'
import { planoService } from '../../../services/planoService'
import { calcularValorTotal } from '../../../utils/calculations'
import { PlanoItensTable } from './PlanoItensTable'

type PlanoItemForm = CreateInput<PlanoItem>

function createEmptyItem(instrumentoId: string): PlanoItemForm {
  return {
    instrumentoId,
    eixo: '',
    penaJustaEixo: '',
    penaJustaIndicadorUf: '',
    planoEstrategicoObjetivos: '',
    setorCorrelacionado: '',
    categoriaItem: 'Equipamento',
    descricao: '',
    codigoNaturezaDespesa: '449052',
    naturezaAquisicao: 'Licitação',
    quantidade: 1,
    unidadeMedida: 'unidade',
    valorUnitarioAutorizado: 0,
    frutoAjuste: 'Não',
    documentoAutorizacao: { nome: '', seiNumero: '' },
    monitorado: 'Sim',
    statusItem: 'Autorizado',
    acaoAjuste: '',
    saldoRendimento: 0,
  }
}

export function PlanoItensTab() {
  const { selectedInstrumentoId } = useAppContext()
  const [version, setVersion] = useState(0)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlanoItemForm>(() => createEmptyItem(selectedInstrumentoId))
  const itens = planoService.listPlanoItensByInstrumento(selectedInstrumentoId)

  function resetForm() {
    setEditingId(null)
    setForm(createEmptyItem(selectedInstrumentoId))
  }

  function saveItem() {
    if (!form.descricao.trim()) return

    if (editingId) {
      planoService.updatePlanoItem(editingId, form)
    } else {
      planoService.createPlanoItem(form)
    }

    setVersion((current) => current + 1)
    resetForm()
  }

  function editItem(item: PlanoItem) {
    setEditingId(item.id)
    setForm({
      instrumentoId: item.instrumentoId,
      eixo: item.eixo,
      penaJustaEixo: item.penaJustaEixo,
      penaJustaIndicadorUf: item.penaJustaIndicadorUf,
      planoEstrategicoObjetivos: item.planoEstrategicoObjetivos,
      setorCorrelacionado: item.setorCorrelacionado,
      categoriaItem: item.categoriaItem,
      descricao: item.descricao,
      codigoNaturezaDespesa: item.codigoNaturezaDespesa,
      naturezaAquisicao: item.naturezaAquisicao,
      quantidade: item.quantidade,
      unidadeMedida: item.unidadeMedida,
      valorUnitarioAutorizado: item.valorUnitarioAutorizado,
      frutoAjuste: item.frutoAjuste,
      documentoAutorizacao: item.documentoAutorizacao,
      monitorado: item.monitorado,
      statusItem: item.statusItem,
      acaoAjuste: item.acaoAjuste,
      saldoRendimento: item.saldoRendimento,
    })
  }

  function deleteItem(id: string) {
    planoService.deletePlanoItem(id)
    setVersion((current) => current + 1)
    if (editingId === id) resetForm()
  }

  void version

  return (
    <div className="grid gap-5">
      <FormSection title={editingId ? 'Editar item autorizado' : 'Novo item autorizado'}>
        <div className="grid grid-cols-3 gap-4">
          <Input label="Eixo" value={form.eixo} onChange={(event) => setForm({ ...form, eixo: event.target.value })} />
          <Input label="Pena Justa - Eixo" value={form.penaJustaEixo} onChange={(event) => setForm({ ...form, penaJustaEixo: event.target.value })} />
          <Input label="Pena Justa - Indicador UF" value={form.penaJustaIndicadorUf} onChange={(event) => setForm({ ...form, penaJustaIndicadorUf: event.target.value })} />
          <Input label="Plano Estratégico - Objetivos" value={form.planoEstrategicoObjetivos} onChange={(event) => setForm({ ...form, planoEstrategicoObjetivos: event.target.value })} />
          <Input label="Setor Correlacionado" value={form.setorCorrelacionado} onChange={(event) => setForm({ ...form, setorCorrelacionado: event.target.value })} />
          <Select label="Categoria do Item / Objeto" options={categoriaItemOptions} value={form.categoriaItem} onChange={(event) => setForm({ ...form, categoriaItem: event.target.value as CategoriaItem })} />
          <Input className="col-span-2" label="Descrição do Item / Objeto" value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} />
          <Select label="Código Natureza de Despesa" options={naturezaDespesaOptions} value={form.codigoNaturezaDespesa} onChange={(event) => setForm({ ...form, codigoNaturezaDespesa: event.target.value as NaturezaDespesa })} />
          <Select label="Natureza da Aquisição" options={naturezaAquisicaoOptions} value={form.naturezaAquisicao} onChange={(event) => setForm({ ...form, naturezaAquisicao: event.target.value as NaturezaAquisicao })} />
          <Input label="Quantidade" min={0} type="number" value={form.quantidade} onChange={(event) => setForm({ ...form, quantidade: Number(event.target.value) })} />
          <Input label="Unidade de Medida" value={form.unidadeMedida} onChange={(event) => setForm({ ...form, unidadeMedida: event.target.value })} />
          <CurrencyInput label="Valor Unitário Autorizado" value={form.valorUnitarioAutorizado} onChange={(value) => setForm({ ...form, valorUnitarioAutorizado: value })} />
          <Input label="Valor Total Autorizado" readOnly value={calcularValorTotal(form.quantidade, form.valorUnitarioAutorizado).toFixed(2)} />
          <Select label="Fruto de ajuste?" options={simNaoOptions} value={form.frutoAjuste} onChange={(event) => setForm({ ...form, frutoAjuste: event.target.value as SimNao })} />
          <Select label="Monitorado?" options={simNaoOptions} value={form.monitorado} onChange={(event) => setForm({ ...form, monitorado: event.target.value as SimNao })} />
          <Select label="Status de item" options={statusItemPlanoOptions} value={form.statusItem} onChange={(event) => setForm({ ...form, statusItem: event.target.value as StatusItemPlano })} />
          <Input label="Ação do Ajuste" value={form.acaoAjuste} onChange={(event) => setForm({ ...form, acaoAjuste: event.target.value })} />
          <CurrencyInput label="Saldo de rendimento R$" value={form.saldoRendimento} onChange={(value) => setForm({ ...form, saldoRendimento: value })} />
          <div className="col-span-3">
            <DocumentReferenceField label="Documento de Autorização" value={form.documentoAutorizacao} onChange={(value) => setForm({ ...form, documentoAutorizacao: value })} />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <Button icon={<X size={17} weight="bold" />} onClick={resetForm} variant="secondary">Limpar</Button>
          <Button disabled={!form.descricao.trim()} icon={editingId ? <Check size={17} weight="bold" /> : <Plus size={17} weight="bold" />} onClick={saveItem}>
            {editingId ? 'Salvar item' : 'Adicionar item'}
          </Button>
        </div>
      </FormSection>

      {itens.length === 0 ? (
        <EmptyState title="Nenhum item autorizado" description="Adicione os itens aprovados no plano de trabalho para iniciar o controle local." />
      ) : (
        <PlanoItensTable itens={itens} onDelete={deleteItem} onEdit={editItem} />
      )}
    </div>
  )
}
