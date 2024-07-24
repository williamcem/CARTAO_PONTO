import { LancarDiaPostgresRepository } from "@infra/db/postgresdb/lancar-dia/lancar-dia";

import { LancarDiaController } from "../../presentation/controllers/lancar-dia/lancar-dia";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeLancarDiaController = (): Controller => {
  const lancarDiaPostgresRepository = new LancarDiaPostgresRepository();
  const lancarDiaController = new LancarDiaController(lancarDiaPostgresRepository);
  return new LogControllerDecorator(lancarDiaController);
};
