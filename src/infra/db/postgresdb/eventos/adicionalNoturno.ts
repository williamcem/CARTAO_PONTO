import moment from "moment";

export function calcularAdicionalNoturno(horarioEsperado: moment.Moment, horarioReal: moment.Moment, lancamento: any): number {
  const inicioAdicionalNoturno = moment.utc(lancamento.cartao_dia.data).set({ hour: 22, minute: 0, second: 0 });
  const fimAdicionalNoturno = moment.utc(lancamento.cartao_dia.data).set({ hour: 5, minute: 0, second: 0 }).add(1, "day");

  let minutosAdicionalNoturno = 0;

  const esperadoEstaNorutno = horarioEsperado.isBetween(inicioAdicionalNoturno, fimAdicionalNoturno);
  const realEstaNorutno = horarioReal.isBetween(inicioAdicionalNoturno, fimAdicionalNoturno);

  if (!esperadoEstaNorutno && !realEstaNorutno) {
    return 0;
  }

  // Verificar se o horário real excede o horário esperado
  if (horarioReal.isAfter(horarioEsperado)) {
    const minutosExcedidos = horarioReal.diff(horarioEsperado, "minutes");

    // Verificar se o horário excedente está dentro do período de adicional noturno
    if (horarioEsperado.isBefore(inicioAdicionalNoturno) && horarioReal.isAfter(inicioAdicionalNoturno)) {
      minutosAdicionalNoturno = Math.min(horarioReal.diff(inicioAdicionalNoturno, "minutes"), minutosExcedidos);
    } else if (horarioEsperado.isAfter(inicioAdicionalNoturno) || horarioEsperado.isBefore(fimAdicionalNoturno)) {
      minutosAdicionalNoturno = Math.min(minutosExcedidos, fimAdicionalNoturno.diff(horarioEsperado, "minutes"));
    }
  } else {
    const minutosFaltantes = horarioEsperado.diff(horarioReal, "minutes");

    if (horarioReal.isBefore(fimAdicionalNoturno) && horarioReal.isAfter(inicioAdicionalNoturno)) {
      minutosAdicionalNoturno = -Math.min(fimAdicionalNoturno.diff(horarioReal, "minutes"), minutosFaltantes);
    } else if (horarioEsperado.isAfter(inicioAdicionalNoturno) || horarioEsperado.isBefore(fimAdicionalNoturno)) {
      minutosAdicionalNoturno = -Math.min(minutosFaltantes, fimAdicionalNoturno.diff(horarioReal, "minutes"));
    }
  }

  const adicionalNoturno = minutosAdicionalNoturno * 0.14;
  return Number(adicionalNoturno.toFixed());
}
