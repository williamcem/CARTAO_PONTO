import { ListarAtestadosModel } from "../models/listar-atestados";

export interface GetAtestados {
  id: number;
}

export interface ListarAtestados {
  list(atestado: number): Promise<ListarAtestadosModel[]>;
}
