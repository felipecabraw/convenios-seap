# Auditoria funcional do SIGINP

## Estado por módulo

| Módulo | Estado | Fonte de verdade | Observação |
| --- | --- | --- | --- |
| Processos Registrados | funcional | `ProcessosRecord.cadastro.dadosGerais` + builders | filtros, ordenação e paginação agora são reais |
| Plano de Trabalho | funcional com pendências | `cadastro.planoTrabalho.itens` | editor real fica no cadastro; atalhos já levam para a etapa correta |
| Processo de Contratação | funcional | `cadastro.processoContratacaoRegistros` | exportação e ida para plano foram amarradas |
| Financeiro | funcional | `cadastro.dadosGerais` + resumos consolidados | depende de valores derivados de plano e contratação |
| Gestão do Instrumento | funcional | `cadastro.gestaoInstrumento` + `cadastro.ajustePt` | histórico e governança persistem |
| Prestação de Contas | funcional com pendências | `cadastro.prestacaoContas` + itens sincronizados do plano | edição da etapa agora pode abrir via cadastro |
| Cadastro do Processo | funcional | `CadastroInstrumentoFormData` | stepper expandido para refletir os módulos reais |

## Ações cenográficas tratadas

| Tela | Ação antiga | Tratamento |
| --- | --- | --- |
| Processos | `Mais filtros` | removida, porque já havia filtros primários visíveis |
| Processos | `Exibir` / `Ordenar por` | viraram controles reais |
| Plano | `Histórico de versões` | virou navegação para o histórico do item selecionado |
| Plano | `Exportar` | virou exportação CSV |
| Plano | `Novo item` / `Editar item` | levam para a etapa `Plano de Trabalho` no cadastro |
| Plano | `Mais ações` | virou atalho lógico para `Contratações` |
| Contratações | `Exportar` | virou exportação CSV |
| Contratações | `Mais ações` | virou atalho lógico para `Plano de Trabalho` |
| Prestação | ajuda / notificações | removidas do cabeçalho de referência |
| Prestação | `Atualizar` | virou atualização local da própria leitura |

## Próximos passos recomendados

1. Extrair `InventoryView`, `PlanView`, `ContractView`, `FinancialView`, `AdjustmentView` e `PrestacaoView` de `src/App.tsx`.
2. Criar hooks por domínio: seleção de processo, persistência, builders de resumo e navegação contextual.
3. Migrar os builders e formatações repetidas para utilitários puros.
4. Conectar o `processos-repository` a uma implementação Supabase sem mexer na UI.
5. Trocar a seed local por fixtures e seeds SQL compatíveis com `supabase/schema.sql`.
