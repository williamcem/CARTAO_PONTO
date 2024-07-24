import { StatusLnacamentoModel } from "@domain/models/status-lancamento";

export interface ListarSatausModel {
  nome: string;
}

export interface ListarStatus {
  list(input: ListarSatausModel): Promise<StatusLnacamentoModel[]>;
}
