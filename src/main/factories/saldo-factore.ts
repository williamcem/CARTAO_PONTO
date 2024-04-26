import { SaldoPostgresRepository } from "../../infra/db/postgresdb/saldoAnt/saldo-repository";
import { SaldoController } from "../../presentation/controllers/saldo/saldo-controller";
import { DbAddSaldoAnt } from "../../data/usecase/saldoAnt/db-add-saldo-ant";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeSaldoController = (): Controller => {
  const saldoPostgresRepository = new SaldoPostgresRepository();
  const dbAddSaldoAnt = new DbAddSaldoAnt(saldoPostgresRepository);
  const saldoController = new SaldoController(dbAddSaldoAnt);
  return new LogControllerDecorator(saldoController);
};
