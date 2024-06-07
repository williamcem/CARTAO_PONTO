import { DbAddDelete } from "../../data/usecase/delete-dia-horarios/db-add-delete";
import { DeletePostgresRepository } from "../../infra/db/postgresdb/delete-dia-horario-repository/delete-dia-horario-repository";
import { DeleteController } from "../../presentation/controllers/deletar/delete-dia-horarios-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeDeleteController = (): Controller => {
  const deletePostgresRepository = new DeletePostgresRepository();
  const dbAddDelete = new DbAddDelete(deletePostgresRepository);
  const deleteController = new DeleteController(dbAddDelete);
  return new LogControllerDecorator(deleteController);
};
