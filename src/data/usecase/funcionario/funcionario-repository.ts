import { AddFuncionarioUpsertModel } from "@domain/usecases/funcionario";

export interface FuncionarioRepository {
  upsert(funcionario: AddFuncionarioUpsertModel): Promise<boolean>;
}
