import { EventosModel } from "@domain/models/eventos";

export interface ArmazenarEventosModel {
  data: Date;
  tipoId: string;
  identificacao: string;
  minutos: number;
}

export interface Eventos {
  add(input: ArmazenarEventosModel): Promise<EventosModel[]>;
}
