import { SolucaoEventoRepository } from "@infra/db/postgresdb/solucao-eventos-repository/solucao-eventos-repository";

import { CriarEventoController } from "../../presentation/controllers/solucao-eventos/solucao-eventos-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeSolucaoEventosController = (): Controller => {
  const solucaoEventoRepository = new SolucaoEventoRepository();
  const criarEventoController = new CriarEventoController(solucaoEventoRepository);
  return new LogControllerDecorator(criarEventoController);
};
