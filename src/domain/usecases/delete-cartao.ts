import { DeleteCartoaModel } from "../models/delete-cartao";

export interface DelDeleteCartoa {
  referencia: string;
}

export interface DeleteCartoa {
  deleteByReferencia(deleteReferencia: DeleteCartoaModel): Promise<void>;
}
