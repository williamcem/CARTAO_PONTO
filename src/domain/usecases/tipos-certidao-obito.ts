import { CertidaoObitoModel } from "@domain/models/tipos-certidao-obito";

export interface ListarCertidaoObitoModel {
  nome: string;
}

export interface ListarCertidaoObito {
  list(input: ListarCertidaoObitoModel): Promise<CertidaoObitoModel[]>;
}
