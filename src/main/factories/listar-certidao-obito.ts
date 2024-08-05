import { ListarCertidaoObitoPostgresRepository } from "@infra/db/postgresdb/listar-certidao-obito/listar-certidao-obito";

import { ListarCertidaoObitoController } from "../../presentation/controllers/listar-certidao-obito/listar-certidao-obito-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeListarCertidaoObitoController = (): Controller => {
  const listarCertidaoObitoPostgresRepository = new ListarCertidaoObitoPostgresRepository();
  const listarCertidaoObitoController = new ListarCertidaoObitoController(listarCertidaoObitoPostgresRepository);
  return new LogControllerDecorator(listarCertidaoObitoController);
};
