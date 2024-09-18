import { DeleteModel } from "../../../domain/models/delete-dia-horarios";

export interface DelDeleteRepository {
  findCartaoDiaById(deleteData: DeleteModel): Promise<boolean>;

  deleteById(deleteData: DeleteModel): Promise<boolean>;
}
