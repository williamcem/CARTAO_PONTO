import { CalcularResumoPostgresRepository } from "../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { CalcularResumoController } from "../../presentation/controllers/calcular-resumo/carcular-resumo-controller";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeCalcularresumoController = (): Controller => {
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const calcularResumoController = new CalcularResumoController(calcularResumoPostgresRepository);
  return new LogControllerDecorator(calcularResumoController);
};
