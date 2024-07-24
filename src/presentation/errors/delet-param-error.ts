export class DeleteParamError extends Error {
  constructor(paramName: string) {
    super("ID do apontamento não fornecido: ${paramName}");
    this.name = "ID do apontamento não fornecido";
  }
}
