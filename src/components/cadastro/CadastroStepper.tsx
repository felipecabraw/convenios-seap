import { CSSProperties } from 'react';
import { CadastroStepDefinition } from '../../data/cadastro';

const stepTones = [
  {
    base: '#f0f2f4',
    accent: '#6d7684',
    active: '#203a67',
    active2: '#0f2344',
  },
  {
    base: '#eef4fd',
    accent: '#6e8fc8',
    active: '#2f578f',
    active2: '#183763',
  },
  {
    base: '#eef5f4',
    accent: '#2a6b6c',
    active: '#1a4f57',
    active2: '#0f2f3a',
  },
  {
    base: '#eff4ec',
    accent: '#4e6d39',
    active: '#37532b',
    active2: '#23391b',
  },
  {
    base: '#fbf0e5',
    accent: '#9a6324',
    active: '#7a4818',
    active2: '#4f2c0f',
  },
  {
    base: '#f6edf0',
    accent: '#8f4b5b',
    active: '#6b3240',
    active2: '#3f1b26',
  },
] as const;

export function CadastroStepper({
  steps,
  activeIndex,
  onStepChange,
}: {
  steps: CadastroStepDefinition[];
  activeIndex: number;
  onStepChange: (index: number) => void;
}) {
  return (
    <div className="cadastro-stepper" role="tablist" aria-label="Etapas do cadastro">
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        const tone = stepTones[index] ?? stepTones[0];
        const style = {
          '--step-base': tone.base,
          '--step-accent': tone.accent,
          '--step-active': tone.active,
          '--step-active-2': tone.active2,
        } as CSSProperties;

        return (
          <button
            key={step.key}
            type="button"
            className={[
              'cadastro-stepper__item',
              isActive ? 'is-active' : '',
              isComplete ? 'is-complete' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={style}
            onClick={() => onStepChange(index)}
          >
            <span className="cadastro-stepper__index">{String(index + 1).padStart(2, '0')}</span>
            <span className="cadastro-stepper__text">
              <strong>{step.label}</strong>
              <small>
                {step.scope === 'inicial' ? 'Cadastro inicial' : step.scope === 'governanca' ? 'Governança' : 'Acompanhamento'}
              </small>
            </span>
          </button>
        );
      })}
    </div>
  );
}
