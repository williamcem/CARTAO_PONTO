export interface RetornarSolucao {
  resetTratado(input: { cartaoDiaId: number }): Promise<boolean>;
}
