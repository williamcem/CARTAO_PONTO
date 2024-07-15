export interface LancarFaltaIdent {
  upsert(input: {
    periodoId: number;
    statusId: number;
    cartao_dia_id: number;
  }): Promise<{ success: boolean; movimentacao60?: number | undefined }>;
}
