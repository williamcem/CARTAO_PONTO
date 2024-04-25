import { SaldoPostgresRepository } from "../../infra/db/postgresdb/saldoAnt/saldo-repository";
import { SaldoController } from "../../presentation/controllers/saldo/saldo-controller";

export const makeSaldoController = (): SaldoController => {
  const saldoPostgresRepository = new SaldoPostgresRepository();
  return new SaldoController(saldoPostgresRepository);
};
