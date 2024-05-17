import { DifMinModel } from "../../domain/models/dif-min";

export interface AddDifMinModel {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string | null;
  saidaTarde: string | null;
}

export interface AddDifMin {
  atualizarDiaParaFalta(difData: DifMinModel): Promise<boolean>;
  buscarPorId(input: { id: string }): Promise<AddDifMinModel | undefined>;
}
