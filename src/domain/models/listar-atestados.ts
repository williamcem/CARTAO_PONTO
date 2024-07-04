export interface ListarAtestadosModel {
  id?: number;
  nomeFuncionario: string;
  identificacao: number;
  Periodo: Date;
  saida: number;
  retorno: number;
  tipo: string;
  grupoCID: string;
  descricao: string;
  userName?: string;
  funcionarioId: number;
}
