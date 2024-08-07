export interface CartaoUpsertModel {
  identificacao: string;
  funcionarioId: number;
  referencia: Date;
  saldoAnterior60: number;
  saldoAnterior100: number;
  status: { id: number; descricao: string };
  dias: {
    data: Date;
    periodoDescanso: number;
    cargaHor: number;
    cargaHorPrimeiroPeriodo: number;
    cargaHorSegundoPeriodo: number;
    cargaHorariaCompleta: string;
    cargaHorNoturna: number;
    status: {
      id: number;
      descricao: string;
    };
  }[];
}
