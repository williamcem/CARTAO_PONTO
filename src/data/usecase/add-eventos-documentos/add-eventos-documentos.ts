export interface AdicionarEventosDocumentos {
  add(input: { identificacao?: string }): Promise<boolean>;
}
