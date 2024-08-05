export interface AtestadoModel {
  id?: number;
  data: Date;
  inicio: Date;
  fim: Date;
  grupo_cid?: string;
  descricao?: string;
  userName?: string;
  funcionarioId?: number;
  tipoId: number | null;
  ocupacaoId?: number;
  tipoAcompanhanteId?: number;
  idade_paciente?: number;
  acidente_trabalho: boolean;
  acao: number;
  statusId: number;
  observacao: string;
  sintomas?: string;
  horario_trabalhado_inicio?: string[];
  horario_trabalhado_fim?: string[];
  trabalhou_dia: boolean;
  tipo_comprovanteId?: number;
  nome_acompanhante?: string;
  exame?: string;
  tipoGrauParentescoId?: number;
}
