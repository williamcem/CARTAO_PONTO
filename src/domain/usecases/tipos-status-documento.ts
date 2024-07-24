import { StatusDocumentoModel } from "@domain/models/tipos-status-documento";

export interface ListarStatusDocumentoModel {
  nome: string;
}

export interface ListarOcupacao {
  list(input: ListarStatusDocumentoModel): Promise<StatusDocumentoModel[]>;
}
