export interface CriarEventoOnibus {
  addOnibus(input: { id: number; entradaReal: Date }): Promise<boolean>;
}
