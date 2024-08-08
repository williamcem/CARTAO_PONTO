import { describe, expect, test } from "vitest";
import { GetFuncionarioImpressaoCalculoController } from "./procurar-funcionário-impressao-calculo";
import { FuncionarioImpressaoCalculoPostgresRepository } from "@infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";

describe("Inserir Regra por Hora Extra Depósito", () => {
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    new FuncionarioImpressaoCalculoPostgresRepository(),
  );

  test("30 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 30,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(30);
    expect(regras[1]).toStrictEqual(0);
    expect(regras[2]).toStrictEqual(0);
  });

  test("60 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 60,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(0);
    expect(regras[2]).toStrictEqual(0);
  });

  test("90 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 90,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(30);
    expect(regras[2]).toStrictEqual(0);
  });

  test("120 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 120,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(60);
    expect(regras[2]).toStrictEqual(0);
  });

  test("180 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 180,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(60);
    expect(regras[2]).toStrictEqual(60);
  });

  test("200 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 200,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(60);
    expect(regras[2]).toStrictEqual(80);
  });

  test("500 minutos", async () => {
    const regras = getFuncionarioImpressaoCalculoController.inserirRegraPorHoraExtra({
      minutos: 500,
      parametros: [60, 60, 9999],
    });

    expect(regras[0]).toStrictEqual(60);
    expect(regras[1]).toStrictEqual(60);
    expect(regras[2]).toStrictEqual(380);
  });
});
