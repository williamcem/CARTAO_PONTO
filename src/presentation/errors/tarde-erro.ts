export class TardeParamError extends Error {
  constructor(paramName: string) {
    super("Se entradaTarde ou saidaTarde for fornecidos, ambos devem estar presentes: ${paramName}");
    this.name = "Se entradaTarde ou saidaTarde for fornecidos, ambos devem estar presentes";
  }
}
