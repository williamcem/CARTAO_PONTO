import { ExpotacaoDemitidosModel } from "../models/expotacao-demitidos";

export interface AddExpotacaoModel {
  identificao: number;
  localidade: string;
}

export interface ExpotacaoDemitidosAquivosModel {
  create(input: AddExpotacaoModel): Promise<ExpotacaoDemitidosModel>;
}
