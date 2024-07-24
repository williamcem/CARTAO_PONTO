import { RetornoSolucaoModel } from "@domain/models/retorno-solução";

export interface RetornoSolucaoDia {
  resetTratado(cartaoDiaId: number): Promise<RetornoSolucaoModel>;
}
