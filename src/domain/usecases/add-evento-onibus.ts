import { EventoOnibusModel } from "@domain/models/evento-onibus";

export interface ArmazenarEventoonibus {
  id?: number;
  cartaoDiaId: number;
  hora: string;
  funcionarioId: number;
  minutos: number;
  tipoId: number;
  tratado: boolean;
  inicio: Date;
  fim: Date;
  atestadoFuncionarioId?: number;
}

export interface EventoOnibus {
  add(input: ArmazenarEventoonibus): Promise<EventoOnibusModel[]>;
}
