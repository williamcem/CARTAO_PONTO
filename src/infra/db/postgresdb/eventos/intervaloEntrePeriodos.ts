import moment from "moment";

// Função para calcular a diferença em minutos entre dois períodos
export function calcularIntervaloEntrePeriodos(
  horarioSaidaPrimeiroPeriodo: moment.Moment,
  horarioEntradaSegundoPeriodo: moment.Moment,
): number {
  const diferenca = horarioEntradaSegundoPeriodo.diff(horarioSaidaPrimeiroPeriodo, "minutes");
  return diferenca;
}

// Função para criar evento do intervalo entre períodos, com ajuste de data se ultrapassar a meia-noite
export function criarEventoIntervaloEntrePeriodos(
  horarioSaidaPrimeiroPeriodo: moment.Moment,
  horarioEntradaSegundoPeriodo: moment.Moment,
  lancamento: any,
  totalPeriodos: number,
): any {
  const minutosIntervalo = calcularIntervaloEntrePeriodos(horarioSaidaPrimeiroPeriodo, horarioEntradaSegundoPeriodo);

  // Ajustar a data caso o intervalo entre períodos ultrapasse a meia-noite
  const ajustarDataSeNecessario = (horarioSaida: moment.Moment, horarioEntrada: moment.Moment): moment.Moment => {
    // Se o horário de entrada do segundo período for menor ou igual a 23:59 e a saída ultrapassa meia-noite
    if (
      horarioSaida.isBefore(horarioEntrada) ||
      (horarioSaida.isSameOrBefore(horarioEntrada) && horarioEntrada.hours() < horarioSaida.hours())
    ) {
      return horarioSaida.clone().add(1, "day"); // Incrementa a data para o próximo dia
    }
    return horarioSaida.clone(); // Mantém a mesma data
  };

  if (minutosIntervalo !== 0) {
    const hora = ordenarHorario({ inicio: horarioSaidaPrimeiroPeriodo, fim: horarioEntradaSegundoPeriodo });

    // Ajuste de data se o horário do segundo período ultrapassar a meia-noite
    const dataSaidaAjustada = ajustarDataSeNecessario(horarioEntradaSegundoPeriodo, horarioSaidaPrimeiroPeriodo);

    return {
      cartaoDiaId: lancamento.cartao_dia.id,
      hora,
      tipoId: 8, // Defina um tipoId apropriado para o intervalo entre períodos
      funcionarioId: lancamento.cartao_dia.cartao.funcionario.id,
      minutos: Number(minutosIntervalo.toFixed()),
      inicio: horarioSaidaPrimeiroPeriodo.toDate(),
      fim: dataSaidaAjustada.toDate(),
    };
  }
  return null;
}

// Função para ordenar os horários (início e fim)
const ordenarHorario = (input: { inicio: moment.Moment; fim: moment.Moment }): string => {
  if (input.inicio.isBefore(input.fim)) {
    return `${input.inicio.format("HH:mm")} - ${input.fim.format("HH:mm")}`;
  } else {
    return `${input.fim.format("HH:mm")} - ${input.inicio.format("HH:mm")}`;
  }
};
