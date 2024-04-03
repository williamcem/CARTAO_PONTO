export class InvalidParamError extends Error {
  constructor(paramName: string) {
    super("Parâmetro inválido: ${paramName}");
    this.name = "Erro de parâmetro inválido";
  }
}
