import { LancamentoDiaModel } from "../models/lancamento-dia";

export interface LancamentoDia {
  entrada: Date;
  saida: Date;
  periodo: number;
  id: number;
}

export interface lancarDia {
  add(input: LancamentoDia): Promise<LancamentoDiaModel>;
}
