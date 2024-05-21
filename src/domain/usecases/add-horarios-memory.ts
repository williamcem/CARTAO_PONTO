import { HorariosMemoryModel } from "@domain/models/horarios-memory";

export interface AddHorariosMemoryModel {
  recebeDia: {
    saldoAnterior?: number | undefined;
    data?: Date | undefined;
    nome?: string | undefined;
    matricula?: string | undefined;
    setor?: string | undefined;
    expediente?: string | undefined;
    mes?: string | undefined;
    status: string;
  };
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min: number;
  dif_min100: number;
  saldoAtual: number;
  status: string;
}

export interface AddMemoryHorarios {
  adicionarHorarioMemoria(memoryData: HorariosMemoryModel): Promise<HorariosMemoryModel>;
}
