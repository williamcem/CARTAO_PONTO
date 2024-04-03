export class MissingParamError extends Error {
  constructor(paramName: string) {
    super("Parâmetros ausentes: ${paramName}");
    this.name = "Erro de partâmetro ausente";
  }
}
