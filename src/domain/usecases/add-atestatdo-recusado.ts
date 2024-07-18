import { AtestadoRecusadoModel } from "@domain/models/atestado-recusado";

export interface AddAtestadoRecusadoModel {
  id: number;
  inicio?: Date;
  fim?: Date;
  statusId: number;
  observacao: string;
}

export interface AddAtestadoInicioFimObservacao {
  addObservacao(input: AtestadoRecusadoModel): Promise<boolean>;
}
