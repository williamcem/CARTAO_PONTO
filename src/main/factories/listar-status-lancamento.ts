import { ListarLancamentoRepsository } from "@infra/db/postgresdb/listar-status-lancamento-repository/listar-status-lancamento-repository";

import { ListarStatusController } from "../../presentation/controllers/listar-status-lancamento/listar-status-lancamento-controler";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeProcurarLocalidadeController = (): Controller => {
  const listarLancamentoRepsository = new ListarLancamentoRepsository();
  const listarStatusController = new ListarStatusController(listarLancamentoRepsository);
  return new LogControllerDecorator(listarStatusController);
};
