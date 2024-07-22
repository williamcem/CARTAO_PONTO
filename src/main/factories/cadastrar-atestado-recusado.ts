import { RespaldarAtestadoRecusadoPostgresRepository } from "@infra/db/postgresdb/atestado-recusado-repository/atestado-recusado-repository";

import { RespaldarRecusadoController } from "../../presentation/controllers/atestado-recusado/atestado-recusado";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeAtestadoRecusadoController = (): Controller => {
  const respaldarAtestadoRecusadoPostgresRepository = new RespaldarAtestadoRecusadoPostgresRepository();
  const respaldarRecusadoController = new RespaldarRecusadoController(respaldarAtestadoRecusadoPostgresRepository);
  return new LogControllerDecorator(respaldarRecusadoController);
};
