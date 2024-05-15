export class ExtraParamError extends Error {
  constructor(paramName: string) {
    super("Se entradaExtra ou saidaExtra for fornecidos, ambos devem estar presentes: ${paramName}");
    this.name = "Se entrada Extra ou saida Extra for fornecidos, ambos devem estar presentes";
  }
}
