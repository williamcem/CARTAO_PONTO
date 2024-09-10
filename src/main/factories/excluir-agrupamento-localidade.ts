import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ExcluirAgrupamentoLocalidadeController } from "../../presentation/controllers/excluir-agrupamento-localidade/excluir-agrupamento-localidade";
import { ExcluirAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/excluir-agrupamento-localidade/excluir-agrupamento-localidade";

export const makeExcluirAgrupamentoLocalidadeController = (): Controller => {
  const excluirAgrupamentoLocalidadePostgresRepository = new ExcluirAgrupamentoLocalidadePostgresRepository();
  const excluirAgrupamentoLocalidadeController = new ExcluirAgrupamentoLocalidadeController(
    excluirAgrupamentoLocalidadePostgresRepository,
  );

  return new LogControllerDecorator(excluirAgrupamentoLocalidadeController);
};
