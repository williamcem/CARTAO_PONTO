type IFindFistInput = {
  id: number;
};

type IFindFistOutput = {
  id: number;
  documentoId: number;
  statusId: number;
};

export interface RespaldarAtestado {
  findfirst(input: IFindFistInput): Promise<IFindFistOutput | undefined>;
  findManyCartaoDia(input: { inicio: Date; fim: Date; funcionarioId: number }): Promise<
    {
      id: number;
      data: Date;
      cargaHoraria: number;
      cargaHorariaPrimeiroPeriodo: number;
      cargaHorariaSegundoPeriodo: number;
      cargaHorariaCompleta: string;
      descanso: number;
    }[]
  >;
  updateAtestado(input: {
    id: number;
    statusId: number;
    userName: string;
    abonos: {
      cartaoDiaId: number;
      minutos: number;
    }[];
  }): Promise<boolean>;
}
