export interface ListarDemitidos {
  create(input: { identificacao: string }): Promise<{ id: number } | undefined>;
}
