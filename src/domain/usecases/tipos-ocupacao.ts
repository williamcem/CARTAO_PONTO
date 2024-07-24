import { OcupacaoModel } from "@domain/models/tipos-ocupacao";

export interface ListarOcupacaoModel {
  nome: string;
}

export interface ListarOcupacao {
  list(input: ListarOcupacaoModel): Promise<OcupacaoModel[]>;
}
