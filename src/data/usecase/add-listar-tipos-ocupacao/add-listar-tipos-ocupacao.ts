export interface ListarLacamentos {
  list(): Promise<{ nome: string }[]>;
}
