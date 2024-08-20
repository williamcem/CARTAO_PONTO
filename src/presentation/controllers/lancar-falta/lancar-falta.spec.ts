import { describe, expect, test } from "vitest";
import { LancarFaltaController } from "./lancar-falta";
import { RecalcularTurnoController } from "../recalcular-turno/recalcular-turno";
import { LancarFaltaPostgresRepository } from "@infra/db/postgresdb/lancar-falta/lancar-falta";
import { CriarEventosPostgresRepository } from "@infra/db/postgresdb/eventos/eventos-repository";
import { RecalcularTurnoPostgresRepository } from "@infra/db/postgresdb/recalcular-turno/recalcular-turno";

describe("Existencia minutos noturno", () => {
  const lancarFaltaPostgresRepository = new LancarFaltaPostgresRepository();
  const recalcularTurnoPostgresRepository = new RecalcularTurnoPostgresRepository();
  const recalcularTurnoController = new RecalcularTurnoController(recalcularTurnoPostgresRepository);
  const criarEventosPostgresRepository = new CriarEventosPostgresRepository(recalcularTurnoController);

  const lancarFaltaController = new LancarFaltaController(
    lancarFaltaPostgresRepository,
    criarEventosPostgresRepository,
    recalcularTurnoController,
  );

  test("Inicio 22:00 fim 22:50", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 22, minutos: 0 },
      fim: { hora: 22, minutos: 50 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-30T22:50:00.000Z"),
      inicio: new Date("2024-07-30T22:00:00.000Z"),
      minutos: 50,
    });
  });

  test("Inicio 21:00 fim 22:00", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 21, minutos: 0 },
      fim: { hora: 22, minutos: 0 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-30T22:00:00.000Z"),
      inicio: new Date("2024-07-30T22:00:00.000Z"),
      minutos: 0,
    });
  });

  test("Inicio 04:00 fim 05:00", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 4, minutos: 0 },
      fim: { hora: 5, minutos: 0 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-30T05:00:00.000Z"),
      inicio: new Date("2024-07-30T04:00:00.000Z"),
      minutos: 60,
    });
  });

  test("Inicio 05:00 fim 06:00", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 5, minutos: 0 },
      fim: { hora: 6, minutos: 0 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-30T05:00:00.000Z"),
      inicio: new Date("2024-07-30T05:00:00.000Z"),
      minutos: 0,
    });
  });

  test("Inicio 22:00 fim 05:00", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 22, minutos: 0 },
      fim: { hora: 5, minutos: 0 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-31T05:00:00.000Z"),
      inicio: new Date("2024-07-30T22:00:00.000Z"),
      minutos: 420,
    });
  });

  test("Inicio 17:00 fim 05:00", async () => {
    const result = lancarFaltaController.existeMinutosNoturno({
      data: new Date("2024-07-30T00:00:00Z"),
      inicio: { hora: 17, minutos: 0 },
      fim: { hora: 5, minutos: 0 },
    });

    expect(result).toStrictEqual({
      final: new Date("2024-07-31T05:00:00.000Z"),
      inicio: new Date("2024-07-30T22:00:00.000Z"),
      minutos: 420,
    });
  });
});
