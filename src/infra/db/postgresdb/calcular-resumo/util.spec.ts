import { describe, expect, test } from "vitest";
import { arredondarParteDecimal } from "./utils";

describe("Arredondamento maior 0.6", () => {
  test("-7.5", async () => {
    const resultado = arredondarParteDecimal(-7.5);
    expect(resultado).toStrictEqual(-7);
  });

  test("-7.8", async () => {
    const resultado = arredondarParteDecimal(-7.8);
    expect(resultado).toStrictEqual(-8);
  });
});
