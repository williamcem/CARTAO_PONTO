import { AfastadosUpsertModel } from "../models/afastados";

export interface AddAfastadosUpasertmodel {
  id?: number;
  identificacao: string;
  inicio: Date;
  fim: Date | undefined;
  total: number;
  funcionarioId: number;
  status: {
    id: number;
    nome: string;
  };
  userName: string;
}

export interface AddAfastados {
  add(input: AfastadosUpsertModel): Promise<boolean>;
}
