import { AtestadoModel } from "../models/atestado";

export interface AddAtestadoModel {
  id?: number;
  data: Date;
  inicio: Date;
  fim: Date;
  grupo_cid?: string;
  descricao?: string;
  userName?: string;
  funcionarioId: number;
  tipoId: number;
  ocupacaoId?: number;
  tipoAcompanhanteId?: number;
  idade_paciente?: number;
  acidente_trabalho: boolean;
  acao: number;
  statusId: number;
  observacao: string;
  sintomas?: string;
  horario_trabalhado_inicio?: Date;
  horario_trabalhado_fim?: Date;
  trabalhou_dia: boolean;
  tipo_comprovanteId?: number;
  funcionarioFuncaoId: number;
  nomeFuncionario: string;
  nome_acompanhante?: string;
  exame?: string;
}

export interface AddAtestado {
  add(input: AtestadoModel): Promise<boolean>;
}
