export interface LancarFaltaIdent {
  upsert(input: { periodoId: number; status: number; cartaoDiaId: number }): Promise<boolean>;
}
