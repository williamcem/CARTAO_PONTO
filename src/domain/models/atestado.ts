export interface AtestadoModel {
  id?: number;
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
  proprio: boolean;
  observacao: string;
  statusId: number;
}
