import { LancarFaltaModel } from "../../domain/models/lancar-falta";

export interface LnacarFalta {
  periodoId: number;
  cartaoDiaId: number;
  statusId: number;
}

export interface LancarFaltaDia {
  upsert(input: LancarFaltaModel): Promise<boolean>;
}