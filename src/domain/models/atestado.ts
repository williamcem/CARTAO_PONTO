export interface AtestadoModel {
  id?: number;
  data: Date;
  inicio: Date;
  fim: Date;
  grupo_cid?: string;
  descricao?: string;
  userName?: string;
  funcionarioId?: number;
  tipoId?: number;
  ocupacaoId?: number;
  tipoAcompanhanteId?: number;
  idade_paciente?: number;
  acidente_trabalho: boolean;
  acao: number;
  statusId: number;
  observacao: string;
}
