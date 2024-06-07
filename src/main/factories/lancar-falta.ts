import { LancamentoFaltaPostgresRepository } from "@infra/db/postgresdb/lanca-falta/lanca-falta";

import { GetLancarFaltaController } from "../../presentation/controllers/lancar-falta/lancar-falta";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeLancarFaltaController = (): Controller => {
  const lancamentoFaltaPostgresRepository = new LancamentoFaltaPostgresRepository();
  const getLancarFaltaController = new GetLancarFaltaController(lancamentoFaltaPostgresRepository);
  return new LogControllerDecorator(getLancarFaltaController);
};
