import { DifMinModel } from "../../../domain/models/dif-min";

interface Dia {
  dif_min: number;
}

export interface AddDifMinRepository {
  atualizarDiaParaFalta(difData: DifMinModel): Promise<Dia[]>; // Corrigido para retornar um array de Dia
}
