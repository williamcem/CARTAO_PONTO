export interface EventoOnibusModel {
  id?: number;
  cartaoDiaId: number;
  hora: string;
  funcionarioId: number;
  minutos: number;
  tipoId: number;
  tratado: boolean;
  inicio: Date;
  fim: Date;
  atestadoFuncionarioId?: number;
}
