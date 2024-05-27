export interface ProcurarLocalidadeIdent {
  findMany(): Promise<{ codigo: string; nome: string }[]>;
}
