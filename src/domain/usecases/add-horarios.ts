import { HorariosModel } from "@domain/models/horarios";

export interface AddHorariosModel {
  id: string;
  data: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string;
  saidaTarde: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min: number;
  saldoAnt: number;
}

export interface AddHorarios {
  add(horarios: AddHorariosModel): Promise<HorariosModel>;
}
