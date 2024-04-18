import { AddUpload, AddUploadModel } from "../../../domain/usecases/add-upload";
import { Uploadmodel } from "../../../domain/models/upload-protheus";
import { AddUploadRepository } from "./add-upload-prothues-repository";

export class DbAddUpload implements AddUpload {
  private readonly addUploadRepository: AddUploadRepository;

  constructor(addUploadRepository: AddUploadRepository) {
    this.addUploadRepository = addUploadRepository;
  }

  async add(protheusData: AddUploadModel[]): Promise<Uploadmodel> {
    const prothues = await this.addUploadRepository.add(protheusData);
    return prothues;
  }
}
