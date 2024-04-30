import { DeleteModel } from "../../../domain/models/delete";

export interface DelDeleteRepository {
  deleteById(deleteData: DeleteModel): Promise<void>;
}
