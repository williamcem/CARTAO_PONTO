import { DifMinModel } from "../../../domain/models/dif-min";

interface Dia {
  dif_min: number;
}

export interface AddDifMinRepository {
  listarDiasAnteriores(difData: DifMinModel): Promise<Dia[]>; // Corrigido para retornar um array de Dia
}
