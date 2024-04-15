import { ListarLista, ListarListaModel } from "../../../domain/usecases/lista-horarios";
import { ListaModel } from "../../../domain/models/lista";
import { ListarListaRepository } from "./find-listarhorarios-repository";

export class DbaListar implements ListarLista {
  private readonly findListarRepository: ListarListaRepository;

  constructor(findListarRepository: ListarListaRepository) {
    this.findListarRepository = findListarRepository;
  }

  async find(horariosData: ListarListaModel): Promise<ListaModel[]> {
    const lista = await this.findListarRepository.list(Object.assign({}, horariosData));
    return lista;
  }
}
