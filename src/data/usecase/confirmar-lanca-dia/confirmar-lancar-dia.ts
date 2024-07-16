export interface ConfirmarLancaDia {
  findFisrt(input: { id: number }): Promise<
    | {
        id: number;
        lancamentos: { id: number; entrada: Date | null; saida: Date | null; validadoPeloOperador: boolean; periodoId: number }[];
      }
    | undefined
  >;
  update(input: { id: number }[]): Promise<boolean>;
}
