import { SoluçãoEventoModel } from "@domain/models/solucao-evento";

export interface SolucionarEventosModel {
  data: Date;
  tipoId: string;
  identificacao: string;
  minutos: number;
}

export interface Eventos {
  add(input: SolucionarEventosModel): Promise<SoluçãoEventoModel[]>;
}
