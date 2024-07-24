export interface ListarOcupacao {
  list(): Promise<{ nome: string }[]>;
}
