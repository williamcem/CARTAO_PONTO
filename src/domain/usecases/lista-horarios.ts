import { ListaModel } from "@domain/models/lista";

export interface ListarListaModel {
  data: string;
}

export interface ListarLista {
  find(input: ListarListaModel): Promise<ListaModel[]>;
}
