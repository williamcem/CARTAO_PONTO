import { TiposDocumentosModel } from "@domain/models/tipos-documento";

export interface ListarDocumentoModel {
  nome: string;
}

export interface ListarDocumento {
  list(input: ListarDocumentoModel): Promise<TiposDocumentosModel[]>;
}
