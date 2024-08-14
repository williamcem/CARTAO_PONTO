import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { AlterarLocalidadeController } from "../../presentation/controllers/alterar-localidade/alterar-localidade";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { CriarEventosController } from "../../presentation/controllers/eventos/eventos-controller";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";

export const makeAlterarLocalidadeontroller = (): Controller => {
  const alterarLocalidadePostgresRepository = new AlterarLocalidadePostgresRepository();
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository();
  const criarEventosController = new CriarEventosController(criarEventosPostgresRepository);
  const alterarLocalidadeController = new AlterarLocalidadeController(
    alterarLocalidadePostgresRepository,
    criarEventosController,
  );
  return new LogControllerDecorator(alterarLocalidadeController);
};
