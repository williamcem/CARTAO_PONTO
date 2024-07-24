export interface ListarOcorrencias {
  find(
    identificacao: string,
    localidade: string,
  ): Promise<{
    funcionarios: {
      identificacao: string;
      nome: string;
      dias: { data: Date; eventos: any[]; lancamentos: { periodoId: number; entrada: Date | null; saida: Date | null }[] }[];
    }[];
  }>;
}

export interface ListarOcorrenciasGeral {
  findOcorrencia(localidade: string): Promise<{ funcionarios: { identificacao: string; nome: string }[] }>;
}
