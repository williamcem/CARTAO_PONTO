import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { DesligarFuncionarioController } from "../../presentation/controllers/desligar-funcionario/desligar-funcionario";
import { DesligarFuncionarioPostgresRepository } from "@infra/db/postgresdb/desligar-funcionario/desligar-funcionario";

export const makeDesligarFuncionarioController = (): Controller => {
  const desligarFuncionarioPostgresRepository = new DesligarFuncionarioPostgresRepository();
  const desligarFuncionarioController = new DesligarFuncionarioController(desligarFuncionarioPostgresRepository);

  return new LogControllerDecorator(desligarFuncionarioController);
};
