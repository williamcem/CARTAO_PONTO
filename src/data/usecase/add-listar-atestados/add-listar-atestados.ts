export interface ListarAtestado {
  list(): Promise<{ id: number }[]>;
}

export interface ListarFilial {
  listFilial(): Promise<{ filial: string }[]>;
}
