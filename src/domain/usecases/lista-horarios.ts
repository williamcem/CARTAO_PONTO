import { ListaModel } from "@domain/models/lista";

export interface ListarListaModel {
  entradaManha: string;
}

export interface ListarLista {
  find(input: ListarListaModel): Promise<ListaModel[]>;
}
