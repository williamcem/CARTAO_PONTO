import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { ConsultarAgrupamentoLocalidadeController } from "../../presentation/controllers/consultar-agrupamento-localidade/consultar-agrupamento-localidade";
import { ConsultarAgrupamentoLocalidadePostgresRepository } from "@infra/db/postgresdb/consultar-agrupamento-localidade/consultar-agrupamento-localidade";

export const makeConsultarAgrupamentoLocalidadeController = (): Controller => {
  const consultarAgrupamentoLocalidadePostgresRepository = new ConsultarAgrupamentoLocalidadePostgresRepository();
  const consultarAgrupamentoLocalidadeController = new ConsultarAgrupamentoLocalidadeController(
    consultarAgrupamentoLocalidadePostgresRepository,
  );

  return new LogControllerDecorator(consultarAgrupamentoLocalidadeController);
};
