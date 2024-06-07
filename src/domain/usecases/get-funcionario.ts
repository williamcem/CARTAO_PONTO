import { GetFuncionarioModel } from "../models/get-funcionário";

export interface GetFuncionario {
  identificacao: string;
}

export interface ListarFuncionario {
  find(identificacao: string): Promise<GetFuncionarioModel[]>;
}
