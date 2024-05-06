import { DifMinController } from "../../presentation/controllers/dif-min/dif-min-controller";
import { DifMinPostgresRepository } from "../../infra/db/postgresdb/dif-min-repository/dif-min-repository";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeDifMinController = (): Controller => {
  const difMinPostgresRepository = new DifMinPostgresRepository();
  const difMinController = new DifMinController(difMinPostgresRepository);
  return new LogControllerDecorator(difMinController);
};
