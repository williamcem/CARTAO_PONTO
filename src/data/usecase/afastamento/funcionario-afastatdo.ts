import { AddAfastadosUpasertmodel } from "@domain/usecases/add-afastados"

export interface AfastmentoRepository {
  add(afastamento: AddAfastadosUpasertmodel): Promise<boolean>;
}
