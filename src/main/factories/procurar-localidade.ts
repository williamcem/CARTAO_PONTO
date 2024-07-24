import { LocalidadePostgresRepository } from "@infra/db/postgresdb/procurar-localidades/procurar-localidades";

import { ProcurarLocalidadeController } from "../../presentation/controllers/procurar-localidades/procurar-localidades";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeProcurarLocalidadeController = (): Controller => {
  const localidadePostgresRepository = new LocalidadePostgresRepository();
  const getFuncionarioController = new ProcurarLocalidadeController(localidadePostgresRepository);
  return new LogControllerDecorator(getFuncionarioController);
};
