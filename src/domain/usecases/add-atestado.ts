import { AtestadoModel } from "../models/atestado";

export interface AddAtestadoModel {
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

export interface AddAtestado {
  add(input: AtestadoModel): Promise<boolean>;
}
