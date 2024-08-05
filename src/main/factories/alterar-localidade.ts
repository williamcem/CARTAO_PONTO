import { AlterarLocalidadeController } from "../../presentation/controllers/alterar-localidade/alterar-localidade";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ConfirmarLancaDiaPostgresRepository } from "@infra/db/postgresdb/confirmar-lanca-dia/confirmar-lancar-dia";

export const makeAlterarLocalidadeontroller = (): Controller => {
  const confirmarLancaDiaPostgresRepository = new ConfirmarLancaDiaPostgresRepository();
  const alterarLocalidadeController = new AlterarLocalidadeController(confirmarLancaDiaPostgresRepository);
  return new LogControllerDecorator(alterarLocalidadeController);
};
