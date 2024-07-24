import { SolucoesEventosPostgresRepository } from "@infra/db/postgresdb/listar-solucoes-eventos/listar-solucoes-eventos";

import { ListarSolucoesEventosController } from "../../presentation/controllers/listar-solucoes-eventos/listar-solucoes-eventos-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeTiposSolucoesController = (): Controller => {
  const solucoesEventosPostgresRepository = new SolucoesEventosPostgresRepository();
  const listarSolucoesEventosController = new ListarSolucoesEventosController(solucoesEventosPostgresRepository);
  return new LogControllerDecorator(listarSolucoesEventosController);
};
