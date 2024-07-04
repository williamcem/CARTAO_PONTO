import { DescricacoModel } from "@domain/models/descricacao";

export interface ListarDescricacoModel {
  descricaco: string;
}

export interface ListarDescricaco {
  list(input: ListarDescricacoModel): Promise<DescricacoModel[]>;
}
