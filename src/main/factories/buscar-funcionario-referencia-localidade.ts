import { Controller } from "../../presentation/protocols";
import { LogControllerDecorator } from "../decorators/log";
import { BuscarFuncionarioReferenciaLocalidadeAgrupadaController } from "../../presentation/controllers/buscar-funcionarios-referencia-localidade/buscar-funcionarios-referencia-localidade";
import { BuscarFuncionarioReferenciaLocalidadePostgresRepository } from "@infra/db/postgresdb/buscar-funcionario-referencia-localidade/buscar-funcionario-referencia-localidade";
import { BuscarTodosPostgresRepository } from "@infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";

export const makeBuscarFuncionarioReferenciaLocalidadeController = (): Controller => {
  const buscarFuncionarioReferenciaLocalidadePostgresRepository = new BuscarFuncionarioReferenciaLocalidadePostgresRepository();
  const buscarTodosPostgresRepository = new BuscarTodosPostgresRepository();
  const buscarFuncionarioReferenciaLocalidadeAgrupadaController = new BuscarFuncionarioReferenciaLocalidadeAgrupadaController(
    buscarFuncionarioReferenciaLocalidadePostgresRepository,
    buscarTodosPostgresRepository,
  );
  return new LogControllerDecorator(buscarFuncionarioReferenciaLocalidadeAgrupadaController);
};
