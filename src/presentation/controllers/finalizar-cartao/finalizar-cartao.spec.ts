import { describe, expect, test } from "vitest";
import { FinalizarCartaoController } from "./finalizar-cartao";
import { FinalizarCartaoPostgresRepository } from "@infra/db/postgresdb/finalizar-cartao/finalizar-cartao";
import { GetFuncionarioImpressaoCalculoController } from "../get-funcionário-impressao-calculo/procurar-funcionário-impressao-calculo";
import { FuncionarioImpressaoCalculoPostgresRepository } from "@infra/db/postgresdb/get-funcionario-impressao-calculo/get-funcionario-impressao-calculo";

describe("Mesangem de minutos divergêntes", () => {
  const finalizarCartaoPostgresRepository = new FinalizarCartaoPostgresRepository();
  const funcionarioImpressaoCalculoPostgresRepository = new FuncionarioImpressaoCalculoPostgresRepository();
  const getFuncionarioImpressaoCalculoController = new GetFuncionarioImpressaoCalculoController(
    funcionarioImpressaoCalculoPostgresRepository,
  );
  const finalizarCartaoController = new FinalizarCartaoController(
    finalizarCartaoPostgresRepository,
    getFuncionarioImpressaoCalculoController,
  );

  test("extra 1 diurno faltando 100 minutos", async () => {
    const message = finalizarCartaoController.mensagemMinutosDivergente({
      nome: "extra 1",
      periodo: "diurno",
      resumoSistema: 200,
      somaDoInformado: 100,
    });

    expect(message).toStrictEqual("Está faltando 100 minutos no extra 1 diurno!");
  });

  test("extra 2 noturno sobrando 100 minutos", async () => {
    const message = finalizarCartaoController.mensagemMinutosDivergente({
      nome: "extra 2",
      periodo: "noturno",
      resumoSistema: 100,
      somaDoInformado: 200,
    });

    expect(message).toStrictEqual("Está sobrando 100 minutos no extra 2 noturno!");
  });

  test("Ambos batendo os valores", async () => {
    const message = finalizarCartaoController.mensagemMinutosDivergente({
      nome: "extra 2",
      periodo: "noturno",
      resumoSistema: 100,
      somaDoInformado: 100,
    });

    expect(message).toStrictEqual("");
  });
});
