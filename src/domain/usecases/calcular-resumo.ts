import { ResumoModel } from "@domain/models/calcular-resumo";

export interface CalcularResumoDia {
  calc(identificacao: string): Promise<ResumoModel>;
}
