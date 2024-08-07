import { ResumoModel } from "@domain/models/calcular-resumo";

export interface CalcularResumoDia {
  calc(identificacao: string): Promise<ResumoModel>;
}

export interface CalcularResumoDiaImpressao {
  calc(localidadeId: string): Promise<ResumoModel[]>;
}
