import { ListarFuncionario } from "../../../domain/usecases/get-funcionario";
import { GetFuncionarioModel } from "../../../domain/models/get-funcionário";
import { GetFuncionarioIdent } from "./find-procurar-funcionario";

export class DbGetFuncionario implements ListarFuncionario {
  private readonly getFuncionarioRepository: GetFuncionarioIdent;

  constructor(getFuncionarioRepository: GetFuncionarioIdent) {
    this.getFuncionarioRepository = getFuncionarioRepository;
  }

  async find(identificacao: string): Promise<GetFuncionarioModel[]> {
    const funcionarios = await this.getFuncionarioRepository.list(identificacao);
    return funcionarios;
  }
}
