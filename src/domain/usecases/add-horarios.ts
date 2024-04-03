import { HorariosModel } from "@domain/models/horarios";

export interface AddHorariosModel {
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string;
  saidaTarde: string;
  dif_min: string;
  tipoUm: string;
  tipoDois: string;
}

export interface AddHorarios {
  add(horarios: AddHorariosModel): Promise<HorariosModel>;
}
