import { DeleteController } from "../../presentation/controllers/deletar/delete-controller";
import { DeletePostgresRepository } from "../../infra/db/postgresdb/delete-rpository/delete-repository";
import { Controller } from "../../presentation/protocols";
import { DbAddDelete } from "../../data/usecase/delete/db-add-delete";
import { LogControllerDecorator } from "../decorators/log";

export const makeDeleteController = (): Controller => {
  const deletePostgresRepository = new DeletePostgresRepository();
  const dbAddDelete = new DbAddDelete(deletePostgresRepository);
  const deleteController = new DeleteController(dbAddDelete);
  return new LogControllerDecorator(deleteController);
};
