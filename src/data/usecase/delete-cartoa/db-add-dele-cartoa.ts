import { DelDeleteCartoaRepository } from "./add-delete-cartoa-repository";
import { DeleteCartoa, DelDeleteCartoa } from "../../../domain/usecases/delete-cartao";

export class DbAddDeleteCartao implements DeleteCartoa {
  private readonly delDeleteCartoaRepository: DelDeleteCartoaRepository;

  constructor(delDeleteCartoaRepository: DelDeleteCartoaRepository) {
    this.delDeleteCartoaRepository = delDeleteCartoaRepository;
  }

  async deleteByReferencia(deleteReferencia: DelDeleteCartoa): Promise<void> {
    await this.delDeleteCartoaRepository.deleteByReferencia(deleteReferencia);
  }
}
