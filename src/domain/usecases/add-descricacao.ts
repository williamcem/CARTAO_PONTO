import { DescricacoModel } from "@domain/models/descricao";

export interface ListarDescricacoModel {
  descricaco: string;
}

export interface ListarDescricaco {
  list(input: ListarDescricacoModel): Promise<DescricacoModel[]>;
}
