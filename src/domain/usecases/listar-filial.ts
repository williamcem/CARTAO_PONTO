import { ListarFilialModel } from "@domain/models/listar-filial"

export interface ListarFilial {
  nome: string;
  identificação: string;
  id: string;
}

export interface ListarFilail {
  list(input: ListarFilialModel): Promise<ListarFilialModel[]>;
}
