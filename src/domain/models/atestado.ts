export interface AtestadoModel {
  id?: number;
  nome_funcionario: string;
  identificacao: string;
  inicio: Date;
  fim: Date;
  saida?: number;
  retorno?: number;
  tipo: string;
  grupo_cid: string;
  descricao: string;
  userName?: string;
  funcionarioId?: number;
}
