import {
  BuscarTodosFuncionarios,
  GetTodosFuncionariosModel,
} from "../../../presentation/controllers/buscar-todos-funcionarios/buscar-todos-protocols";

export interface BuscraTodosRepository {
  listAll(funcionarioData: BuscarTodosFuncionarios): Promise<GetTodosFuncionariosModel[]>;
}
