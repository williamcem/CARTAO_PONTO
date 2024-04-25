import { SaldoAntModel } from "../../../domain/models/saldoAnt";

export interface AddSaldoAntRepository {
  addSaldoAnt(saldoAntData: SaldoAntModel): Promise<void>;
}
