export interface ListarDocumento {
  list(): Promise<{ nome: string }[]>;
}
