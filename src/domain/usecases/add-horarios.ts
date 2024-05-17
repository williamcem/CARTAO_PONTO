import { HorariosModel } from "@domain/models/horarios";
import { HorarioData } from "../../presentation/controllers/horarios/horarios";

export interface AddHorariosModel {
  id: string;
  entradaManha?: string;
  saidaManha?: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
}

export interface AddHorarios {
  add(data: HorarioData): Promise<HorariosModel>;
}
