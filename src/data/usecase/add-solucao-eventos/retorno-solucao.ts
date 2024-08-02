export interface RetornarSolucao {
  resetTratado(input: { cartaoDiaId: number; eventoId: number }): Promise<boolean>;
}
