import moment from "moment";

export function calcularTotalMinutos(entrada: string, saida: string, extra?: string): number {
  const [entradaHoras, entradaMinutos] = entrada.split(":").map(Number);
  const [saidaHoras, saidaMinutos] = saida.split(":").map(Number);

  let totalMinutosEntrada = entradaHoras * 60 + entradaMinutos;
  let totalMinutosSaida = saidaHoras * 60 + saidaMinutos;

  if (extra && extra !== "") {
    const [extraHoras, extraMinutos] = extra.split(":").map(Number);
    totalMinutosSaida += extraHoras * 60 + extraMinutos;
  }
  return totalMinutosSaida - totalMinutosEntrada;
}

export function arredondarParteDecimalHoras(numero: number): number {
  const inteiro = Math.floor(numero); // Obtém a parte inteira do número
  const decimal = numero - inteiro; // Obtém a parte decimal do número
  const terceiraCasa = Math.floor((decimal * 1000) % 10); // Obtém a terceira casa decimal

  // Verifica se a terceira casa decimal é maior ou igual a 6
  if (terceiraCasa >= 6) {
    // Arredonda para cima a segunda casa decimal
    return Math.round(numero * 100) / 100;
  } else {
    // Trunca para duas casas decimais
    return Math.floor(numero * 100) / 100;
  }
}

export function arredondarParteDecimal(numero: number): number {
  const inteiro = Math.floor(numero); // Obtém a parte inteira do número
  const decimal = numero - inteiro; // Obtém a parte decimal do número

  // Se a parte decimal for maior ou igual a 0.6, arredonde para cima
  if (decimal >= 0.6) {
    return inteiro + 1; // Adiciona 1 para arredondar para cima
  } else {
    return inteiro; // Mantém o inteiro, arredondando para baixo
  }
}

export const BuscarHorarioNortunoEmMinutos = (data: moment.Moment, inicial: moment.Moment, final: moment.Moment): number => {
  let difMinNotuno = 0;
  const inicioAdicional = moment(data).utc(false).minutes(0).seconds(0).hour(22);
  const finalAdicional = moment(data).utc(false).minutes(0).seconds(0).add(1, "d").hour(5);

  //Quando Entrada e saida estão no adicional
  if (inicial.isBetween(inicioAdicional, finalAdicional)) {
    if (inicial.isAfter(inicioAdicional)) {
      if (final.isBefore(finalAdicional)) {
        difMinNotuno = final.diff(inicial, "minutes");
      }
    }
  }

  //Quando a saida está entre o adicional e a entrada está antes
  if (final.isBetween(inicioAdicional, finalAdicional) && inicial?.isBefore(inicioAdicional)) {
    difMinNotuno = final.diff(inicioAdicional, "minutes");
  }

  //Quando a entrada está entre o adicional e a saida depois
  if (inicial.isBetween(inicioAdicional, finalAdicional) && final?.isAfter(finalAdicional)) {
    difMinNotuno = finalAdicional.diff(inicial, "minutes");
  }

  //Quando inicio e final do adicional estão entre entrada e saida e entrada é antes do inicio do adicional e a saída é depois do fim do adicional
  if (
    inicioAdicional.isBetween(inicial, final) &&
    finalAdicional.isBetween(inicial, final) &&
    inicial.isBefore(inicioAdicional) &&
    final.isAfter(finalAdicional)
  ) {
    difMinNotuno = finalAdicional.diff(inicioAdicional, "minutes");
  }

  if (inicial.isSame(inicioAdicional)) {
    if (final.isBefore(finalAdicional)) {
      difMinNotuno = final.diff(inicial, "minutes");
    } else {
      difMinNotuno = finalAdicional.diff(inicial, "minutes");
    }
  }

  if (final.isSame(finalAdicional)) {
    if (inicial.isBefore(inicioAdicional)) {
      difMinNotuno = final.diff(inicioAdicional, "minutes");
    } else {
      difMinNotuno = final.diff(inicial, "minutes");
    }
  }

  return difMinNotuno;
};
