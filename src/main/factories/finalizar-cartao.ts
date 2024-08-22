import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { FinalizarCartaoController } from "../../presentation/controllers/finalizar-cartao/finalizar-cartao";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";

export const makeFinalizarCartaoController = (): Controller => {
  const finalizarCartaoPostgresRepository = new FinalizarCartaoPostgresRepository();
  const buscarCidController = new FinalizarCartaoController(finalizarCartaoPostgresRepository);
  return new LogControllerDecorator(buscarCidController);
};
