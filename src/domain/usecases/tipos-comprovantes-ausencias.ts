import { ComprovanteModel } from "@domain/models/tipos-comprovantes-ausencias";

export interface ListarComprovanteModel {
  nome: string;
}

export interface ListarComprovante {
  list(input: ListarComprovante): Promise<ComprovanteModel[]>;
}
