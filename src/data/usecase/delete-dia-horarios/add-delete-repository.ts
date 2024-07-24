import { DeleteModel } from "../../../domain/models/delete-dia-horarios";

export interface DelDeleteRepository {
  deleteById(deleteData: DeleteModel): Promise<void>;
}
