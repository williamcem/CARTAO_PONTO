export interface GetFuncionarioModel {
  id: number;
  filial: string;
  identificacao: string;
  nome: string;
  turnoId: number;
  centroCustoId: number;
  funcaoId: number;
  dataNascimento: Date;
  dataAdmissao: Date;
  dataDemissao: Date | null;
}
