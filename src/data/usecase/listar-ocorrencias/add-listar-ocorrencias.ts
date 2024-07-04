export interface ListarOcorrencias {
  find(localidade: string): Promise<{ funcionarios: { identificacao: string }[] }>;
}
