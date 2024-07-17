import { EventosDocumentosModel } from "@domain/models/eventos-documentos";

export interface ArmazenarEventosModel {
  data: Date;
  tipoId: string;
  identificacao: string;
  minutos: number;
}

export interface EventosDocumentos {
  add(input: ArmazenarEventosModel): Promise<EventosDocumentosModel[]>;
}
