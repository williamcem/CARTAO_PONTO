import { GetTodosFuncionariosModel } from "../../../domain/models/buscar-todos-funcionarios";
import { BuscarTodos, BuscarTodosFuncionarios } from "../../../domain/usecases/buscar-todos-funcionarios";
import { BuscraTodosRepository } from "./add-buscar-todos-funcionarios";

export class DbBuscarTodos implements BuscarTodos {
  private readonly findAllBuscarTodosRepository: BuscraTodosRepository;

  constructor(findAllBuscarTodosRepository: BuscraTodosRepository) {
    this.findAllBuscarTodosRepository = findAllBuscarTodosRepository;
  }

  async findAll(input: BuscarTodosFuncionarios): Promise<GetTodosFuncionariosModel[]> {
    const todos = await this.findAllBuscarTodosRepository.listAll(Object.assign({}, input));
    return todos;
  }
}
