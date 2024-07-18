import { AtestadoAprovadoModel } from "@domain/models/atestado-aprovado";

export interface AddAtestadoAprovadoModel {
  id: number;
  inicio: Date;
  fim: Date;
  statusId: number;
}

export interface AddAtestadoInicioFim {
  addInicioFim(input: AtestadoAprovadoModel): Promise<boolean>;
}
