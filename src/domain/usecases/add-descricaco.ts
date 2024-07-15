import { DescricacoModel } from "@domain/models/descricaco";

export interface ListarDescricacoModel {
  descricaco: string;
}

export interface ListarDescricaco {
  list(input: ListarDescricacoModel): Promise<DescricacoModel[]>;
}
