export interface AdicionarEventos {
  add(input: { entrada: Date; saida: Date; identificacao: string; tipoId: number }): Promise<boolean>;
}
