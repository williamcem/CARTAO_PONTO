import { DifMinPostgresRepository } from "@infra/db/postgresdb/dif-min-repository/dif-min-repository";
import { DifMinController } from "../../presentation/controllers/dif-min/dif-min-controller";

export const makeDifMinController = (): DifMinController => {
  const difMinPostgresRepository = new DifMinPostgresRepository();
  return new DifMinController(difMinPostgresRepository);
};
