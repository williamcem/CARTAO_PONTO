import { AddUploadModel, Uploadmodel } from "../../../presentation/controllers/upload-protheus/upload-protocols";

export interface AddUploadRepository {
  add(protheusData: AddUploadModel[]): Promise<Uploadmodel>;
}
