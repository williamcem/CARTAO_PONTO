import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { GetLancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";
import { LancamentoFaltaPostgresRepository } from "@infra/db/postgresdb/lanca-falta/lanca-falta";

export const makeLancarFaltaController = (): Controller => {
  const lancamentoFaltaPostgresRepository = new LancamentoFaltaPostgresRepository();
  const getLancarFaltaController = new GetLancarFaltaController(lancamentoFaltaPostgresRepository);
  return new LogControllerDecorator(getLancarFaltaController);
};
