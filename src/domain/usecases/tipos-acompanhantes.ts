import { AcompanhanteModel } from "@domain/models/tipos-acompanhante";

export interface ListarAcompanhanteModel {
  nome: string;
}

export interface ListarAcompanhante {
  list(input: ListarAcompanhanteModel): Promise<AcompanhanteModel[]>;
}
