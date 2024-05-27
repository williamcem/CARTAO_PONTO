import { DeleteModel } from "../../domain/models/delete";

export interface DelDeleteModel {
  cartao_dia_id: number;
}

export interface DelDelete {
  deleteById(deleteData: DeleteModel): Promise<void>;
}
