import { describe, expect, test } from "vitest";
import { GetFuncionarioImpressaoCalculoController } from "./procurar-funcionário-impressao-calculo";
import { FuncionarioImpressaoCalculoPostgresRepository } from "@infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";

const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
  new FuncionarioImpressaoCalculoPostgresRepository(),
);

describe("Inserir Regra por Hora Extra Depósito", () => {
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

describe("Cálcula minutos do dia", () => {
  test("Saldo atual 53 com -54 minutos do dia existe norturno -39", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: -54,
      saldoAtual: 53,
    });

    expect(minutos).toStrictEqual(-39);
  });

  test("Saldo atual 55 com -87 minutos do dia existe norturno -62", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: -87,
      saldoAtual: 55,
    });

    expect(minutos).toStrictEqual(-62);
  });

  test("Saldo atual 55 com 50 minutos do dia existe norturno 50", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: 50,
      saldoAtual: 55,
    });

    expect(minutos).toStrictEqual(50);
  });

  test("Saldo atual -55 com 50 minutos do dia existe norturno 50", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: 50,
      saldoAtual: -55,
    });

    expect(minutos).toStrictEqual(50);
  });

  test("Saldo atual 50 com -55 minutos do dia -34", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: -55,
      saldoAtual: 50,
    });

    expect(minutos).toStrictEqual(-34);
  });

  test("Saldo atual -50 com 55 minutos do dia 55", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: 55,
      saldoAtual: -50,
    });

    expect(minutos).toStrictEqual(55);
  });

  test("Saldo atual 50 com 55 minutos do dia 55", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: 55,
      saldoAtual: 50,
    });

    expect(minutos).toStrictEqual(55);
  });

  test("Saldo atual -50 com -55 minutos do dia -55", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: -55,
      saldoAtual: -50,
    });

    expect(minutos).toStrictEqual(-55);
  });

  test("Saldo atual 15 com -42 minutos do dia -33", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: -42,
      saldoAtual: 15,
    });

    expect(minutos).toStrictEqual(-33);
  });

  test("Saldo atual 120 com -528 minutos do dia -456", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: false,
      minutosDiurnos: -528,
      saldoAtual: 120,
    });

    expect(minutos).toStrictEqual(-456);
  });

  test("Saldo atual 120 com -200 minutos do dia tem noturno -146", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: -200,
      saldoAtual: 120,
    });

    expect(minutos).toStrictEqual(-146);
  });

  test("Saldo atual 500 com -200 minutos do dia tem noturno -143", async () => {
    const minutos = getFuncionarioImpressaoCalculoController.executarCalculo({
      existeFaltaNoturna: true,
      minutosDiurnos: -200,
      saldoAtual: 500,
    });

    expect(minutos).toStrictEqual(-143);
  });
});

describe("Regra de compensação", () => {
  test("Minutos -200 sem saldo", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -200,
      saldo: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -200, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -50 sem saldo", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -50,
      saldo: { diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -50, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -50 com ext1 20", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -50,
      saldo: { diurno: { ext1: 20, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -30, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -50 com ext1 60", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -50,
      saldo: { diurno: { ext1: 60, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: 10, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -120 com ext1 60 e ext2 50", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -120,
      saldo: { diurno: { ext1: 60, ext2: 50, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -10, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -120 com ext1 60 e ext2 60", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -120,
      saldo: { diurno: { ext1: 60, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: 0, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -130 com ext1 60 e ext2 60", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -130,
      saldo: { diurno: { ext1: 60, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -10, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -50 com ext1 60 e ext2 60", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -50,
      saldo: { diurno: { ext1: 60, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: 10, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -50 com ext1 60 e ext2 60", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -50,
      saldo: { diurno: { ext1: 60, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: 10, ext2: 60, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });

  test("Minutos -145 com ext1 60 e ext2 60 e ext3 20", async () => {
    const resultado = getFuncionarioImpressaoCalculoController.executarRegraCompensacaoComExtra({
      minutos: -145,
      saldo: { diurno: { ext1: 60, ext2: 60, ext3: 20 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } },
    });

    expect({ diurno: { ext1: -5, ext2: 0, ext3: 0 }, noturno: { ext1: 0, ext2: 0, ext3: 0 } }).toStrictEqual(resultado);
  });
});
