import { ListaModel, ListarListaModel } from "../../../presentation/controllers/lista/lista-protocols";

export interface ListarListaRepository {
  list(horariosData: ListarListaModel): Promise<ListaModel[]>;
}
