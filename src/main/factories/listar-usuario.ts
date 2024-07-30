import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ListarUsuarioPostgresRepository } from "@infra/db/postgresdb/listar-usuario/listar-usuario-repository";
import { ListarUsuarioController } from "../../presentation/controllers/listar-usuario/listar-usuario-controler";

export const makeListarUsuarioController = (): Controller => {
  const solucaoEventoRepository = new ListarUsuarioPostgresRepository();
  const listarUsuarioController = new ListarUsuarioController(solucaoEventoRepository);
  return new LogControllerDecorator(listarUsuarioController);
};
