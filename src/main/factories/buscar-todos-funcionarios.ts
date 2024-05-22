import { BuscarTodosPostgresRepository } from "../../infra/db/postgresdb/buscar-todos-funcionarios.ts/buscas-todos-repository";
import { LogControllerDecorator } from "../decorators/log";
import { Controller } from "../../presentation/protocols";
import { BuscarTodosFuncionarioController } from "../../presentation/controllers/buscar-todos-funcionarios/buscar-todos-controller";

export const makeBuscarTodosController = (): Controller => {
  const buscarTodosPostgresRepository = new BuscarTodosPostgresRepository();
  const buscarTodosFuncionarioController = new BuscarTodosFuncionarioController(buscarTodosPostgresRepository);
  return new LogControllerDecorator(buscarTodosFuncionarioController);
};
