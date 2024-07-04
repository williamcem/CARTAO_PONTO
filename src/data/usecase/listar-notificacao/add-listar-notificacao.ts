export interface ListarNotificacao {
  find(localidade: string): Promise<{ funcionarios: { identificacao: string; cartao: any }[] }>;
}
