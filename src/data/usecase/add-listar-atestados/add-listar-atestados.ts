export interface ListarAtestado {
  list(): Promise<{ id: number }[]>;
}

export interface ListarFilial {
  listFilial(): Promise<{ filial: string }[]>;
}

export interface ListarTodosAtestados {
  listarTodos(): Promise<{ filial: string }[]>;
}
