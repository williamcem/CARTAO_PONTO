import { GetOcorrenciaModel } from "../../domain/models/listar-ocorrencia";

export interface GetOcorrencia {
  localidade: number;
}

export interface ListarOcorrencia {
  find(localidade: number): Promise<GetOcorrenciaModel[]>;
}
