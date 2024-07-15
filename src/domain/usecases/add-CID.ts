import { CidModel } from "@domain/models/CID";

export interface ListarCidModel {
  grupo_cid: string;
}

export interface ListarCid {
  list(input: ListarCidModel): Promise<CidModel[]>;
}
