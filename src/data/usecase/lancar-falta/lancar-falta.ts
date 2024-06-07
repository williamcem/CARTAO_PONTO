export interface LancarFaltaIdent {
  upsert(input: {
    periodoId: number;
    statusId: number;
    cartaoDiaId: number;
  }): Promise<{ success: boolean; movimentacao60?: number | undefined }>;
}
