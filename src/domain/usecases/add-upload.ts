import { Uploadmodel } from "@domain/models/upload-protheus";

export interface AddUploadModel {
  id: string;
  dado1: string;
  dado2: string;
  dado3: string;
  dado4: string;
  dado5: string;
  dado6: string;
}

export interface AddUpload {
  add(horarios: AddUploadModel[]): Promise<Uploadmodel>;
}
