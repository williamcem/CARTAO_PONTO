export interface ListarOcorrencias {
  find(localidade: string): Promise<{ funcionarios: { identificacao: string }[] }>;
}

export interface ListarOcorrenciasGeral {
  findOcorrencia(localidade: string): Promise<{ funcionarios: { identificacao: string; nome: string }[] }>;
}
