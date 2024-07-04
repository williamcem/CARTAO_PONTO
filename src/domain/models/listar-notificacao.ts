export interface GetNotificacaoModel {
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
  cartao: Cartao[];
  movimentacao60: string;
}

interface CartaoDiaLancamento {
  id: number;
  periodoId: number;
  entrada: string;
  saida: string;
  diferenca: number;
  statusId: number;
  cartao_dia_id: number;
}

interface CartaoDiaStatus {
  id: number;
  nome: string;
}

interface CartaoDia {
  id: number;
  data: string;
  statusId: number;
  cartaoId: number;
  periodoDescanso: number;
  cargaHor: number;
  cargaHorPrimeiroPeriodo: number;
  cargaHorSegundoPeriodo: number;
  cargaHorariaCompleta: string;
  cargaHorariaNoturna: number;
  cartao_dia_lancamentos: CartaoDiaLancamento[];
  cartao_dia_status: CartaoDiaStatus;
  dif_total: number;
  movimentacao60: number;
  movimentacao100: number;
}

interface CartaoStatus {
  id: number;
  nome: string;
}

interface Cartao {
  id: number;
  funcionarioId: number;
  referencia: string;
  saldoAnterior60: number;
  saldoAnterior100: number;
  statusId: number;
  cartao_dia: CartaoDia[];
  cartao_status: CartaoStatus;
}

interface Turno {
  id: number;
  nome: string;
}

interface Localidade {
  codigo: string;
  nome: string;
}
