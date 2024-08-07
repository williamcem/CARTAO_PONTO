export interface ListarTiposCertidaoObito {
  list(): Promise<{ nome: string }[]>;
}
