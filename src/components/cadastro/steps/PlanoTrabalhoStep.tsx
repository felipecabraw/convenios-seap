import { CadastroInstrumentoFormData, PlanoItemForm } from '../../../data/cadastro';
import { ItemTable } from '../ItemTable';

export function PlanoTrabalhoStep({
  data,
  onItemsChange,
}: {
  data: CadastroInstrumentoFormData['planoTrabalho'];
  onItemsChange: (items: PlanoItemForm[]) => void;
}) {
  return (
    <ItemTable items={data.itens} onItemsChange={onItemsChange} />
  );
}
