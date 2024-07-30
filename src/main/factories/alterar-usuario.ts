import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { AlterarUsuarioController } from "../../presentation/controllers/alterar-usuario/alterar-usuario-controller";
import { AlterarUsuarioRepository } from "@infra/db/postgresdb/alterar-usuario/alterar-usuario-repository";

export const makeAlterarUsuarioController = (): Controller => {
  const alterarUsuarioRepository = new AlterarUsuarioRepository();
  const alterarUsuarioController = new AlterarUsuarioController(alterarUsuarioRepository);
  return new LogControllerDecorator(alterarUsuarioController);
};
