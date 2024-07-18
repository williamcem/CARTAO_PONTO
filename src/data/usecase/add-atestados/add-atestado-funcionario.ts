import { AddAtestadoModel } from "@domain/usecases/add-atestado";
import { AddAtestadoAprovadoModel } from "@domain/usecases/add-atestatdo-aprovado";
import { AddAtestadoRecusadoModel } from "@domain/usecases/add-atestatdo-recusado";

export interface AtestadoRepository {
  add(atestado: AddAtestadoModel): Promise<boolean>;
}

export interface AddAtestadoInicioFimRepository {
  addInicioFim(input: AddAtestadoAprovadoModel): Promise<boolean>;
}

export interface AddAtestadoInicioFimObservacao {
  addObservacao(input: AddAtestadoRecusadoModel): Promise<boolean>;
}
