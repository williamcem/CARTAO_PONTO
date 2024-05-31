import { DeleteCartoaModel } from "../../../domain/models/delete-cartao"

export interface DelDeleteCartoaRepository {
  deleteByReferencia(deleteReferencia: DeleteCartoaModel): Promise<void>
}
