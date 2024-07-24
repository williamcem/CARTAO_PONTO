import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ListarPerfilController } from "../../presentation/controllers/listar-perfil/listar-perfil-controller";
import { ListarPerfilRepository } from "@infra/db/postgresdb/listar-perfil/listar-perfil-repository";

export const makeListarPerfilController = (): Controller => {
  const listarPerfilRepository = new ListarPerfilRepository();
  const retornarSolucaoController = new ListarPerfilController(listarPerfilRepository);
  return new LogControllerDecorator(retornarSolucaoController);
};
