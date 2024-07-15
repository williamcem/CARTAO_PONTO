import moment from "moment";

import { arredondarParteDecimal } from "./utils";

export function calcularIntervaloEntrePeriodos(
  horarioSaidaPrimeiroPeriodo: moment.Moment,
  horarioEntradaSegundoPeriodo: moment.Moment,
): number {
  const diferenca = horarioEntradaSegundoPeriodo.diff(horarioSaidaPrimeiroPeriodo, "minutes");
  return diferenca;
}

export function criarEventoIntervaloEntrePeriodos(
  horarioSaidaPrimeiroPeriodo: moment.Moment,
  horarioEntradaSegundoPeriodo: moment.Moment,
  lancamento: any,
  totalPeriodos: number,
): any {

  const minutosIntervalo = calcularIntervaloEntrePeriodos(horarioSaidaPrimeiroPeriodo, horarioEntradaSegundoPeriodo);
  if (minutosIntervalo !== 0) {
    const hora =
      minutosIntervalo > 0
        ? `${horarioSaidaPrimeiroPeriodo.format("HH:mm")} - ${horarioEntradaSegundoPeriodo.format("HH:mm")}`
        : `${horarioEntradaSegundoPeriodo.format("HH:mm")} - ${horarioSaidaPrimeiroPeriodo.format("HH:mm")}`;

    return {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora,
      tipoId: 8, // Defina um tipoId apropriado para o intervalo entre períodos
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: arredondarParteDecimal(minutosIntervalo),
    };
  }
  return null;
}
