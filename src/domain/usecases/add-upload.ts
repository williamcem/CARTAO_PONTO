import { Uploadmodel } from "@domain/models/upload-protheus";

export interface AddUploadModel {
  id: string;
  mes: string;
  data: Date;
  diaSemana: string;
  status: string;
  nome: string;
  matricula: string;
  setor: string;
  expediente: string;
  saldoanterior: number;
}

export interface AddUpload {
  add(horarios: AddUploadModel[]): Promise<Uploadmodel>;
}
