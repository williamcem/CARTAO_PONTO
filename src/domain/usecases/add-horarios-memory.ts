import { HorariosMemoryModel } from "@domain/models/horariosMemory";

export interface AddHorariosMemoryModel {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min: number;
  saldoAnt: number;
}

export interface AddMemoryHorarios {
  adicionarHorarioMemoria(memoryData: HorariosMemoryModel): Promise<HorariosMemoryModel>;
}
