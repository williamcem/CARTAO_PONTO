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

export function arredondarParteDecimal(numero: number): number {
  const inteiro = Math.floor(numero); // Obtém a parte inteira do número
  const decimal = numero - inteiro; // Obtém a parte decimal do número

  // Se a parte decimal for maior que 0.5, arredonde para cima
  if (decimal > 0.5) {
    return inteiro + 1; // Adiciona 1 para arredondar para cima
  } else {
    return inteiro; // Mantém o inteiro, arredondando para baixo
  }
}
