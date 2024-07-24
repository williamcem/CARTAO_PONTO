import { CalcularResumoPostgresRepository } from "../../infra/db/postgresdb/calcular-resumo/calcular-resumo-repository";
import { FuncionarioAtestadoPostgresRepository } from "../../infra/db/postgresdb/funcionario-atestado/funcionario-atestado";
import { FuncionarioAtestadoController } from "../../presentation/controllers/funcionário-atestado/procurar-funcionário";
import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";

export const makeGetFuncionarioAtestadoController = (): Controller => {
  const funcionarioAtestadoPostgresRepository = new FuncionarioAtestadoPostgresRepository();
  const calcularResumoPostgresRepository = new CalcularResumoPostgresRepository();
  const funcionarioAtestadoController = new FuncionarioAtestadoController(
    funcionarioAtestadoPostgresRepository,
    calcularResumoPostgresRepository,
  );
  return new LogControllerDecorator(funcionarioAtestadoController);
};
