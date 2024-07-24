export interface ListarAtestado {
  list(): Promise<{ id: number }[]>;
}

export interface ListarFilial {
  listFilial(): Promise<{ filial: string }[]>;
}

export interface ListarTodosAtestados {
  listarTodos(funcionarioId: number): Promise<{ funcionarioId: number }[]>;
}

export interface ListarAtestados60Dias {
  listar60Dias(funcionarioId: number): Promise<{ funcionarioId: number }[]>;
}
