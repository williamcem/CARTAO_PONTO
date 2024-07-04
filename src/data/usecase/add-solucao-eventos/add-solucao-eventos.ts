export interface AdicionarSolucao {
  add(input: { id: number; entrada: Date; saida: Date; identificacao: string; tipoId: number }): Promise<boolean>;
}
