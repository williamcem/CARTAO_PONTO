import { GetNotificacaoModel } from "../models/listar-notificacao";

export interface GetNotificacao {
  localidade: number;
}

export interface ListarNoticacao {
  find(localidade: number): Promise<GetNotificacaoModel[]>;
}
