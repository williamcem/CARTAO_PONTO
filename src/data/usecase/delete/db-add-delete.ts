import { DelDeleteRepository } from "./add-delete-repository";
import { DelDelete, DelDeleteModel } from "../../../domain/usecases/delete-horarios";

export class DbAddDelete implements DelDelete {
  private readonly deldeleteRepository: DelDeleteRepository;

  constructor(deldeleteRepository: DelDeleteRepository) {
    this.deldeleteRepository = deldeleteRepository;
  }

  async deleteById(deleteData: DelDeleteModel): Promise<void> {
    await this.deldeleteRepository.deleteById(deleteData);
  }
}
