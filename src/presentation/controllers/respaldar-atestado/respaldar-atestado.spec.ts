import { describe, expect, test } from "vitest";
import { RespaldarController } from "./respaldar-atestado";
import { RespaldarAtestadoPostgresRepository } from "@infra/db/postgresdb/respaldar-atestado/respaldar-atestado";

describe("Gerar abono de atestado", () => {
  const respaldarController = new RespaldarController(new RespaldarAtestadoPostgresRepository());

  test("1º Periodo", async () => {
    const atestado = {
      id: 2,
      documentoId: 1,
      statusId: 1,
      fim: new Date("2024-07-16T09:00:00.000Z"),
      inicio: new Date("2024-07-16T07:15:00.000Z"),
      funcionarioId: 1,
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, atestado);

    expect(abonos).toStrictEqual([{ atestadoId: 2, data: new Date("2024-07-16T00:00:00.000Z"), minutos: 105 }]);
  });

  test("2º Periodo", async () => {
    const periodo = {
      inicio: new Date("2024-07-16T15:00:00.000Z"),
      fim: new Date("2024-07-16T17:00:00.000Z"),
    };

    const dias = [
      {
        id: 22,
        cargaHoraria: 528,
        cargaHorariaPrimeiroPeriodo: 318,
        cargaHorariaSegundoPeriodo: 210,
        data: new Date("2024-07-16T00:00:00.000Z"),
        cargaHorariaCompleta: "07.12;12.30;13.30;17.00;01.00",
        descanso: 60,
      },
    ];

    const abonos = respaldarController.gerarAbono(dias, periodo);

    expect(abonos).toStrictEqual([{ atestadoId: 2, data: new Date("2024-07-16T00:00:00.000Z"), minutos: 120 }]);
  });
});
