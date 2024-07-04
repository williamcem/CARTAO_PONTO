import { AddGrupoTrabalhoUpersetModel } from "../../../domain/usecases/grupo-trabalho";

export interface GrupoTrabalhoRepository {
  upsert(grupo: AddGrupoTrabalhoUpersetModel): Promise<boolean>;
}
