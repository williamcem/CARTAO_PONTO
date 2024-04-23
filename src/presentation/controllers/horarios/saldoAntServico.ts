export class SaldoAntServico {
  calcularSaldoAnt(saldoAntAtual: number, dif_min: number): number {
    // Verifica se a diferença dif_min está entre -10 e 10
    if (dif_min >= -10 && dif_min <= 10) {
      return saldoAntAtual; // Retorna o saldoAntAtual sem modificar
    }
    // Calcula e retorna o novo saldoAnt
    return saldoAntAtual + dif_min;
  }
}
