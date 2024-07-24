export interface ListarTiposComprovantes {
  list(): Promise<{ nome: string }[]>;
}
