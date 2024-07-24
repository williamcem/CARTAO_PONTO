export interface ListarTiposDocumentos {
  list(): Promise<{ nome: string }[]>;
}
