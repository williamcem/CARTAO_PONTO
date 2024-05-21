import { GetFuncionarioModel, ListarFuncionario } from "../../../presentation/controllers/procurar-funcionário/procurra-funcionario-protocols";

export interface GetFuncionarioIdent {
  list(funcionarioData: string): Promise<GetFuncionarioModel[]>;
}
