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
  status?: string;
  recebeDia?: {
    saldoAnterior?: number;
    data?: Date;
    nome?: string;
    matricula?: string;
    setor?: string;
    expediente?: string;
  };
}

export interface Resumo {
  saldoAnterior: number;
  nome?: string;
  matricula?: string;
  setor?: string;
  expediente?: string;
}
