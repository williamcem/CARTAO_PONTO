import { DelDelete, DelDeleteModel } from "../../../domain/usecases/delete-dia-horarios";
import { DelDeleteRepository } from "./add-delete-repository";

export class DbAddDelete implements DelDelete {
  private readonly deldeleteRepository: DelDeleteRepository;

  constructor(deldeleteRepository: DelDeleteRepository) {
    this.deldeleteRepository = deldeleteRepository;
  }

  async deleteById(deleteData: DelDeleteModel): Promise<boolean> {
    return await this.deldeleteRepository.deleteById(deleteData);
  }

  async findCartaoDiaById(deleteData: DelDeleteModel): Promise<boolean> {
    return await this.deldeleteRepository.findCartaoDiaById(deleteData);
  }
}
