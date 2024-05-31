import { DeleteCartaoController } from "../../presentation/controllers/delete-cartao/delete-cartao-controller";
import { DeleteCartaoPostgresRepository } from "../../infra/db/postgresdb/delete-cartao-repository/delete-cartao-repository";
import { Controller } from "../../presentation/protocols";
import { DbAddDeleteCartao } from "../../data/usecase/delete-cartoa/db-add-dele-cartoa";
import { LogControllerDecorator } from "../decorators/log";

export const makeDeleteCartaoController = (): Controller => {
  const deleteCartaoPostgresRepository = new DeleteCartaoPostgresRepository();
  const dbAddDeleteCartao = new DbAddDeleteCartao(deleteCartaoPostgresRepository);
  const deleteCartaoController = new DeleteCartaoController(dbAddDeleteCartao);
  return new LogControllerDecorator(deleteCartaoController);
};
