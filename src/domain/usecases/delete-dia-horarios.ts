import { DeleteModel } from "../models/delete-dia-horarios";

export interface DelDeleteModel {
  cartao_dia_id: number;
}

export interface DelDelete {
  deleteById(deleteData: DeleteModel): Promise<void>;
}
