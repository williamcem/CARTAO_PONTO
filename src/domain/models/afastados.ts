export interface AfastadosUpsertModel {
  id?: number;
  identificacao: string;
  inicio: Date;
  fim: Date | undefined;
  total: number;
  funcionarioId: number;
  status: {
    id: number;
    nome: string;
  };
  userName: string;
}
