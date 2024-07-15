export interface AdicionarEventos {
  add(input: { identificacao?: string }): Promise<boolean>;
}
