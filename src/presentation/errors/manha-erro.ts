export class ManhaParamError extends Error {
  constructor(paramName: string) {
    super("Se entradaManha ou saidaManha for fornecidos, ambos devem estar presentes: ${paramName}");
    this.name = "Se entradaTarde ou saidaTarde for fornecidos, ambos devem estar presentes";
  }
}
