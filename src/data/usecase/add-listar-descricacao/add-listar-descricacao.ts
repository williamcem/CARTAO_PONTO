export interface ListarDescricaco {
  list(): Promise<{ descricaco: string }[]>;
}
