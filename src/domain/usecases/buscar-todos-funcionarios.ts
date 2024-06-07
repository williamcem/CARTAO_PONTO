import { GetTodosFuncionariosModel } from "../models/buscar-todos-funcionarios";

export interface BuscarTodosFuncionarios {
  identificacao?: string;
  localidade?: {
    codigo?: string;
  };
}

export interface BuscarTodos {
  findAll(input: BuscarTodosFuncionarios): Promise<GetTodosFuncionariosModel[]>;
}
