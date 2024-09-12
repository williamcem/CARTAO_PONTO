import { describe, test, expect } from "vitest";
import { SolucaoEventoRepository } from "./solucao-eventos-repository";

describe("Calcular minutos na ação de evento", () => {
  const solucaoEventoRepository = new SolucaoEventoRepository();
  test("Compensar zera os minutos", () => {
    const minutos = solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
      tipoId: 3,
      minutosOriginal: 500,
    });

    expect(minutos).equals(0);
  });

  test("Abonar mantêm minutos originais", () => {
    const minutos = solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
      tipoId: 12,
      minutosOriginal: 500,
    });

    expect(minutos).equals(500);
  });

  test("Descanço zera os minutos", () => {
    const minutos = solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
      tipoId: 7,
      minutosOriginal: 500,
    });

    expect(minutos).equals(0);
  });

  test("Falta justificada mantêm minutos originais", () => {
    const minutos = solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
      tipoId: 6,
      minutosOriginal: 500,
    });

    expect(minutos).equals(500);
  });

  test("Falta inustificada mantêm minutos originais", () => {
    const minutos = solucaoEventoRepository.calcularMinutosBaseadoNaAcao({
      tipoId: 6,
      minutosOriginal: 500,
    });

    expect(minutos).equals(500);
  });
});
