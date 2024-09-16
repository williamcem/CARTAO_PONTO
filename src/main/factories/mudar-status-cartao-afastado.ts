import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { MudarStatusCartaoAfastadoController } from "../../presentation/controllers/mudar-status-cartao-afastado/mudar-status-cartao-afastado";
import { MudarStatusCartaoAfastadoPostgresRepository } from "@infra/db/postgresdb/mudar-status-cartao-afastado/mudar-status-cartao-afastado";

export const makeMudarStatusCartaoAfastadoController = (): Controller => {
  const mudarStatusCartaoAfastadoPostgresRepository = new MudarStatusCartaoAfastadoPostgresRepository();
  const mudarStatusCartaoAfastadoController = new MudarStatusCartaoAfastadoController(
    mudarStatusCartaoAfastadoPostgresRepository,
  );

  return new LogControllerDecorator(mudarStatusCartaoAfastadoController);
};
