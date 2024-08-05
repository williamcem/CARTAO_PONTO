import { AlterarLocalidadePostgresRepository } from "@infra/db/postgresdb/alterar-localidade/alterar-localidade";
import { AlterarLocalidadeController } from "../../presentation/controllers/alterar-localidade/alterar-localidade";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeAlterarLocalidadeontroller = (): Controller => {
  const alterarLocalidadePostgresRepository = new AlterarLocalidadePostgresRepository();
  const alterarLocalidadeController = new AlterarLocalidadeController(alterarLocalidadePostgresRepository);
  return new LogControllerDecorator(alterarLocalidadeController);
};
