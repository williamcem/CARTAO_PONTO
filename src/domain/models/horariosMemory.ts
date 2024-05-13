export interface HorariosMemoryModel {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde?: string;
  saidaTarde?: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min?: number;
  dif_min100?: number;
  somaDifMin100?: number;
  saldoAtual?: number;
  adicionalNoturno?: number;
  somaAdicionalNoturno?: number;
  somaDif_min?: number;
  recebeDia?: { saldoAtual: number };
}
