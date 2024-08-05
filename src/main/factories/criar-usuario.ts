import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { CriarUsuarioController } from "../../presentation/controllers/criar-usuario/criar-usuario-controler";
import { CriarUsuarioPostgresRepository } from "@infra/db/postgresdb/criar-usuario/criar-usuario-repository";

export const makeCriarUsuarioController = (): Controller => {
  const criarUsuarioPostgresRepository = new CriarUsuarioPostgresRepository();
  const criarUsuarioController = new CriarUsuarioController(criarUsuarioPostgresRepository);
  return new LogControllerDecorator(criarUsuarioController);
};
