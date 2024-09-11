import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { CriarAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/criar-agrupamento-localidade/criar-agrupamento-localidade";
import { CriarAgrupamentoLocalidadeController } from "../../presentation/controllers/criar-agrupamento-localidade/criar-agrupamento-localidade";

export const makeCriarAgrupamentoLocalidadeController = (): Controller => {
  const criarAgrupamentoLocalidadePostgresRepository = new CriarAgrupamentoLocalidadePostgresRepository();
  const criarAgrupamentoLocalidadeController = new CriarAgrupamentoLocalidadeController(
    criarAgrupamentoLocalidadePostgresRepository,
  );

  return new LogControllerDecorator(criarAgrupamentoLocalidadeController);
};
