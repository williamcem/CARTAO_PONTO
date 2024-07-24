import { RetornoSolucaoRepository } from "@infra/db/postgresdb/retorno-solucao/retorno-solucao-repository";

import { RetornarSolucaoController } from "../../presentation/controllers/retornar-solucao/retornar-solucao-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeRetornarSolucaoController = (): Controller => {
  const retornoSolucaoRepository = new RetornoSolucaoRepository();
  const retornarSolucaoController = new RetornarSolucaoController(retornoSolucaoRepository);
  return new LogControllerDecorator(retornarSolucaoController);
};
