import { AddAtestadoModel } from "@domain/usecases/add-atestado";

export interface AtestadoRepository {
  add(atestado: AddAtestadoModel): Promise<boolean>;
}
