import { LancarFaltaModel } from "../models/lancar-falta";

export interface LnacarFalta {
  periodoId: number;
  cartao_dia_id: number;
  statusId: number;
  userName: string;
}

export interface LancarFaltaDia {
  upsert(input: LancarFaltaModel): Promise<boolean>;
}
