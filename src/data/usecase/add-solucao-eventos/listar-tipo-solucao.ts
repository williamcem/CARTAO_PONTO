export interface ProcurarSolucoes {
  list(): Promise<{ id: number; nome: string }[]>;
}
