import { FuncionarioPostgresRepository } from "@infra/db/postgresdb/get-funcionario/get-funcionario";

import { NotificacaoPostgresRepository } from "../../infra/db/postgresdb/listar-notificacao/listar-notificacao-repository";
import { NotificacoesController } from "../../presentation/controllers/listar-notificacao/listar-notificacao-controler";
import { GetFuncionarioController } from "../../presentation/controllers/procurar-funcionário/procurar-funcionário";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarNotificacoesController = (): Controller => {
  const notificacaoPostgresRepository = new NotificacaoPostgresRepository();
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(funcionarioPostgresRepository);
  const notificacoesController = new NotificacoesController(notificacaoPostgresRepository, getFuncionarioController);
  return new LogControllerDecorator(notificacoesController);
};
