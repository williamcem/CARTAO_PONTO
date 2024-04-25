import { SaldoAntModel } from "../../domain/models/saldoAnt";

export interface AddSaldoAntModel {
  id: string;
  saldoAnt: number;
}

export interface AddSaldoAnt {
  addSaldoAnt(saldoAntData: SaldoAntModel): Promise<void>;
}
