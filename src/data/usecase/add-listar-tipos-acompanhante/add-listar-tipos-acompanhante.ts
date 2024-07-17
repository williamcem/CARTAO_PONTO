export interface ListarAcompanhante {
  list(): Promise<{ nome: string }[]>;
}
