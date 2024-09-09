import { CartaoUpsertModel } from "../models/cartao";

export interface AddCartaoUpsertModel {
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
  userName: string;
  anterior?: {
    diurno: {
      ext1: number;
      ext2: number;
      ext3: number;
    };
    noturno: {
      ext1: number;
      ext2: number;
      ext3: number;
    };
  };
}

export interface AddCartoes {
  upsert(input: CartaoUpsertModel): Promise<
    | {
        id: number;
        dias: {
          id: number;
          data: Date;
          descanso: number;
          cargaHoraria: number;
          cargaHorariaCompleta: string;
          cargaHorariaPrimeiroPeriodo: number;
          cargaHorariaSegundoPeriodo: number;
        }[];
      }
    | undefined
  >;
}
