import { AtestadoRecusadoRepository } from "@infra/db/postgresdb/atestado-recusado-repository/atestado-recusado-repository";

import { AtestadoRecusadoController } from "../../presentation/controllers/cadastrar-atestado-recusado/cadastrar-atestado-recusado";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCadastrarAtestadoRecusadoController = (): Controller => {
  const atestadoRecusadoRepository = new AtestadoRecusadoRepository();
  const atestadoRecusadoController = new AtestadoRecusadoController(atestadoRecusadoRepository);
  return new LogControllerDecorator(atestadoRecusadoController);
};
