import { DifMinModel } from "../../domain/models/dif-min";

export interface AddDifMinModel {
  dif_min: number;
}

export interface AddDifMin {
  listarDiasAnteriores(difData: DifMinModel): Promise<AddDifMinModel>;
}
