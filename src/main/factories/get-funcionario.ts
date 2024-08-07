import { CalcularResumoPostgresRepository } from "../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { FuncionarioPostgresRepository } from "../../infra/db/postgresdb/get-funcionario/get-funcionario";
import { GetFuncionarioController } from "../../presentation/controllers/get-funcionário/procurar-funcionário";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioController = (): Controller => {
  const funcionarioPostgresRepository = new FuncionarioPostgresRepository();
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const getFuncionarioController = new GetFuncionarioController(
    funcionarioPostgresRepository,
    calcularResumoPostgresRepository,
  );
  return new LogControllerDecorator(getFuncionarioController);
};
