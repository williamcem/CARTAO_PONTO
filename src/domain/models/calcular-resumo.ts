export interface ResumoModel {
  identificacao: string;
  cartao: {
    referencia: string;
    dias: {
      data: string;
      periodoDescanso: number;
      cargaHor: number;
      cargaHorariaCompleta: string;
      cargaHorariaNoturna: number;
      ResumoDia: {
        movimentacao60: number | string;
        movimentacao100: number | string;
        movimentacaoNoturna60: number | string;
        movimentacaoNoturna100: number | string;
      };
    }[];
  }[];
  Resumo: {
    movimentacao: {
      sessenta: number;
      cem: number;
    };
    soma: {
      sessenta: number;
      cem: number;
    };
    horas: {
      diurnas: {
        sessenta: number;
        cem: number;
      };
      noturnas: {
        sessenta: number;
        cem: number;
      };
    };
    saldoAnterior: {
      sessenta: number;
      cem: number;
    };
  };
}
