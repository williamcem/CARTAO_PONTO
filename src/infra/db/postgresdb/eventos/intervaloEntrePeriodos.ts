import moment from "moment";

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
    const hora = ordenarHorario({ inicio: horarioSaidaPrimeiroPeriodo, fim: horarioSaidaPrimeiroPeriodo });

    return {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora,
      tipoId: 8, // Defina um tipoId apropriado para o intervalo entre períodos
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: Number(minutosIntervalo.toFixed()),
    };
  }
  return null;
}

const ordenarHorario = (input: { inicio: moment.Moment; fim: moment.Moment }): string => {
  if (input.inicio.isBefore(input.fim)) {
    return `${input.inicio.format("HH:mm")} - ${input.fim.format("HH:mm")}`;
  } else {
    return `${input.fim.format("HH:mm")} - ${input.inicio.format("HH:mm")}`;
  }
};
