import { ArrowLeft, ArrowRight, Check, FloppyDisk } from '@phosphor-icons/react'
import { useState } from 'react'
import { useAppContext } from '../../app/appContext'
import { Button } from '../../components/ui/Button'
import { instrumentoService } from '../../services/instrumentoService'
import type { Banco, InstrumentoTipo, Modalidade, NaturezaDespesa, SimNao } from '../../data/database.types'
import { InstrumentoDadosGeraisForm, type DadosGeraisForm } from './components/InstrumentoDadosGeraisForm'
import { InstrumentoFinanceiroForm, type FinanceiroForm } from './components/InstrumentoFinanceiroForm'
import { InstrumentoGestaoForm, type GestaoForm } from './components/InstrumentoGestaoForm'
import { InstrumentoReviewStep } from './components/InstrumentoReviewStep'

const steps = ['Dados gerais', 'Financeiro', 'Gestão', 'Revisão']

const initialDados: DadosGeraisForm = {
  numeroInternoSeap: '',
  modalidade: 'Voluntária',
  normativo: '',
  tipo: 'Convênio',
  numero: '',
  anoFormalizacao: new Date().getFullYear(),
  prazoValidade: '',
  vigenciaInicial: '',
  vigenciaFinal: '',
  prazoFinalClausulaSuspensiva: '',
  dataFinalClausulaSuspensiva: '',
  repasseFinanceiro: 'Sim',
}

const initialFinanceiro: FinanceiroForm = {
  banco: 'Banco do Brasil',
  contaBancaria: '',
  naturezaDespesa: '449052',
  valorGlobal: 0,
  repasseParticipe: 0,
  repasseSeap: 0,
  saldoConta: 0,
  dataAtualizacaoSaldoConta: '',
  publicacaoDoeSitePncp: '',
}

const initialGestao: GestaoForm = {
  fiscalInstrumento: '',
  portariaSei: '',
  substatus: 'Em elaboração',
  prorrogacao: 'Não',
}

export function InstrumentoCreatePage({ onCreated }: { onCreated: () => void }) {
  const { refreshInstrumentos, selectInstrumento, setRoute } = useAppContext()
  const [step, setStep] = useState(0)
  const [dados, setDados] = useState(initialDados)
  const [financeiro, setFinanceiro] = useState(initialFinanceiro)
  const [gestao, setGestao] = useState(initialGestao)
  const [error, setError] = useState('')

  function validateCurrentStep() {
    if (step === 0) {
      if (!dados.numeroInternoSeap.trim() || !dados.tipo || !dados.numero.trim() || !dados.anoFormalizacao || !dados.vigenciaInicial || !dados.vigenciaFinal) {
        return 'Preencha Nº Interno SEAP, tipo, número, ano e vigência.'
      }
    }

    if (step === 1 && financeiro.valorGlobal <= 0) {
      return 'Informe valor global maior que zero.'
    }

    return ''
  }

  function goNext() {
    const validation = validateCurrentStep()
    if (validation) {
      setError(validation)
      return
    }

    setError('')
    setStep((current) => Math.min(current + 1, steps.length - 1))
  }

  function createInstrumento() {
    const validation = validateCurrentStep()
    if (validation) {
      setError(validation)
      return
    }

    const created = instrumentoService.createInstrumentoCompleto({
      instrumento: {
        ...dados,
        status: 'Em elaboração',
        alertas: [],
        uploadTermo: { nome: 'Termo pendente', seiNumero: '' },
      },
      financeiro: {
        ...financeiro,
        situacaoRepasseSeap: 'Não iniciado',
        saldoEconomicidade: 0,
        rendimentoAplicacaoExistente: 0,
        rendimentoAplicacaoAutorizado: 0,
        recursoExecutado: 0,
      },
      gestao,
      historico: {
        data: new Date().toISOString().slice(0, 10),
        titulo: 'Instrumento criado',
        descricao: 'Cadastro inicial do instrumento no ambiente local.',
        responsavel: 'Usuário autenticado',
      },
    })

    refreshInstrumentos()
    selectInstrumento(created.instrumento.id)
    onCreated()
    setRoute({ module: 'instrumentos', instrumentosTab: 'overview' })
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="sigic-kicker">Novo instrumento</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-[var(--sigic-ink)]">Cadastro central do instrumento</h2>
          <p className="mt-2 text-sm text-[var(--sigic-muted)]">Crie o registro principal e os dados iniciais de financeiro e gestão.</p>
        </div>
        <Button icon={<ArrowLeft size={17} weight="bold" />} onClick={() => setRoute({ module: 'instrumentos', instrumentosTab: 'overview' })} variant="secondary">
          Voltar
        </Button>
      </div>

      <div className="sigic-panel rounded-xl p-5">
        <div className="grid grid-cols-4 gap-3">
          {steps.map((label, index) => (
            <div className={`rounded-lg border px-3 py-2 text-sm font-bold ${index === step ? 'border-[var(--sigic-green)] bg-emerald-50 text-[var(--sigic-green)]' : index < step ? 'border-emerald-100 bg-white text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`} key={label}>
              <span className="mr-2 inline-grid h-5 w-5 place-items-center rounded-full bg-white text-xs">{index < step ? <Check size={12} weight="bold" /> : index + 1}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {step === 0 && <InstrumentoDadosGeraisForm value={dados} onChange={setDados} />}
          {step === 1 && <InstrumentoFinanceiroForm value={financeiro} onChange={setFinanceiro} />}
          {step === 2 && <InstrumentoGestaoForm value={gestao} onChange={setGestao} />}
          {step === 3 && <InstrumentoReviewStep dados={dados} financeiro={financeiro} gestao={gestao} />}
        </div>

        <aside className="sigic-panel rounded-xl p-5">
          <p className="sigic-kicker">Resumo</p>
          <p className="mt-3 text-lg font-black text-[var(--sigic-ink)]">{dados.numeroInternoSeap || 'Sem número interno'}</p>
          <p className="mt-2 text-sm text-[var(--sigic-muted)]">{dados.tipo} · {dados.numero || 'nº pendente'}</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-700">
            <span>Valor global: <strong>{financeiro.valorGlobal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong></span>
            <span>Fiscal: <strong>{gestao.fiscalInstrumento || 'Não informado'}</strong></span>
            <span>Status inicial: <strong>Em elaboração</strong></span>
          </div>
          {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">{error}</p>}
        </aside>
      </section>

      <div className="flex justify-end gap-3">
        <Button disabled={step === 0} onClick={() => setStep((current) => Math.max(current - 1, 0))} variant="secondary">
          Voltar
        </Button>
        {step < steps.length - 1 ? (
          <Button icon={<ArrowRight size={17} weight="bold" />} onClick={goNext}>
            Continuar
          </Button>
        ) : (
          <Button icon={<FloppyDisk size={17} weight="bold" />} onClick={createInstrumento}>
            Criar instrumento
          </Button>
        )}
      </div>
    </div>
  )
}

export type InstrumentoCreateDados = {
  numeroInternoSeap: string
  modalidade: Modalidade
  normativo: string
  tipo: InstrumentoTipo
  numero: string
  anoFormalizacao: number
  prazoValidade: string
  vigenciaInicial: string
  vigenciaFinal: string
  prazoFinalClausulaSuspensiva: string
  dataFinalClausulaSuspensiva: string
  repasseFinanceiro: SimNao
}

export type InstrumentoCreateFinanceiro = {
  banco: Banco
  contaBancaria: string
  naturezaDespesa: NaturezaDespesa
  valorGlobal: number
  repasseParticipe: number
  repasseSeap: number
  saldoConta: number
  dataAtualizacaoSaldoConta: string
  publicacaoDoeSitePncp: string
}
