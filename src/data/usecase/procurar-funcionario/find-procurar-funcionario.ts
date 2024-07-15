import { ResumoModel } from "@domain/models/calcular-resumo";

import { GetFuncionarioModel } from "../../../presentation/controllers/procurar-funcionário/procurra-funcionario-protocols";

export interface GetFuncionarioIdent {
  findFisrt(funcionarioData: string, localidade: string): Promise<GetFuncionarioModel | undefined>;
}

export interface CalcularResumoDia {
  calc(identificacao: string): Promise<ResumoModel>;
}
