export interface HorariosModel {
  id: string;
  entradaManha: string;
  saidaManha: string;
  entradaTarde: string;
  saidaTarde: string;
  entradaExtra?: string;
  saidaExtra?: string;
  dif_min?: number;
  saldoAnt?: number;
}
