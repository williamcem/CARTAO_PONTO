import { ResumoModel } from "@domain/models/calcular-resumo";

import { GetFuncionarioModel } from "../../../presentation/controllers/get-funcionário/procurra-funcionario-protocols";

export interface GetFuncionarioIdent {
  findFisrt(funcionarioData: string, localidade: string): Promise<GetFuncionarioModel | undefined>;
}

export interface GetFuncionarioIdentCalculo {
  findAllByLocalidade(localidade: string): Promise<GetFuncionarioModel[]>;
}

export interface CalcularResumoDia {
  calc(identificacao: string): Promise<ResumoModel>;
}

export interface GetFuncionarioAtestado {
  atestadoFuncionario(identificacao: string): Promise<GetFuncionarioModel | undefined>;
}
