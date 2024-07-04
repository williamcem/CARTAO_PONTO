export interface ListarAtestado {
  list(): Promise<{ id: number }[]>;
}
