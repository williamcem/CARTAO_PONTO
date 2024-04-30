import { DeleteModel } from "../../domain/models/delete";

export interface DelDeleteModel {
  id: string;
}

export interface DelDelete {
  deleteById(deleteData: DeleteModel): Promise<void>;
}
