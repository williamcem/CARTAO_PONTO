import { CriarUsuarioPostgresRepository } from "@infra/db/postgresdb/criar-usuario/criar-usuario-repository";
import { OcorrenciaGeralPostgresRepository } from "../../infra/db/postgresdb/listar-ocorrencias-geral/listar-ocorrencias-repository";
import { CriarUsuarioController } from "../../presentation/controllers/criar-usuario/criar-usuario-controler";

import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCriarUsuarioController = (): Controller => {
  const criarUsuarioPostgresRepository = new CriarUsuarioPostgresRepository();
  const criarUsuarioController = new CriarUsuarioController(criarUsuarioPostgresRepository);
  return new LogControllerDecorator(criarUsuarioController);
};
