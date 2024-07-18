import { SolucoesAtestadoPostgresRepository } from "@infra/db/postgresdb/listar-solucoes-atestado/listar-solucoes-atestado";

import { ListarSolucoesAtestadoController } from "../../presentation/controllers/listar-solucoes-atestado/listar-solucoes-atestado-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeSolucaoEventosAtestadoController = (): Controller => {
  const solucoesAtestadoPostgresRepository = new SolucoesAtestadoPostgresRepository();
  const listarSolucoesAtestadoController = new ListarSolucoesAtestadoController(solucoesAtestadoPostgresRepository);
  return new LogControllerDecorator(listarSolucoesAtestadoController);
};
