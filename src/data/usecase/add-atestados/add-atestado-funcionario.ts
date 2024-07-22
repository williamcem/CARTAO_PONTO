import { AddAtestadoModel } from "@domain/usecases/add-atestado";
import { AddAtestadoRecusadoModel } from "@domain/usecases/add-atestatdo-recusado";

export interface AtestadoRepository {
  add(atestado: AddAtestadoModel): Promise<boolean>;
}

export interface AddAtestadoInicioFimObservacao {
  addObservacao(input: AddAtestadoRecusadoModel): Promise<boolean>;
}
