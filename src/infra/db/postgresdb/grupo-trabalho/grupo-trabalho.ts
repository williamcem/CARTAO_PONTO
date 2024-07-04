export interface AddGrupoUpsertModel {
  id?: number;
  cod_turno: number;
  descri_turno: string;
  status_turno: string;
  dia_semana: string;
  tipo_dia: string;
  hora_1_entrada: string;
  hora_1_saida: string;
  hora_2_entrada: string;
  hora_2_saida: string;
  hora_3_entrada: string;
  hora_3_saida: string;
  hora_4_entrada: string;
  hora_4_saida: string;
  total_horas_1_periodo: string;
  total_horas_2_periodo: string;
  total_horas_3_periodo: string;
  total_horas_4_periodo: string;
  total_horas_1_intervalo: string;
  total_horas_2_intervalo: string;
  total_horas_3_intervalo: string;
  total_horas_trabalhadas: string;
  total_horas_intervalo: string;
  total_horas_dia: string;
  userName: string;
}

export interface AddGrupoTrabalho {
  id?: number;
  cod_turno: number;
  descri_turno: string;
  status_turno: string;
  dia_semana: string;
  tipo_dia: string;
  hora_1_entrada: string;
  hora_1_saida: string;
  hora_2_entrada: string;
  hora_2_saida: string;
  hora_3_entrada: string;
  hora_3_saida: string;
  hora_4_entrada: string;
  hora_4_saida: string;
  total_horas_1_periodo: string;
  total_horas_2_periodo: string;
  total_horas_3_periodo: string;
  total_horas_4_periodo: string;
  total_horas_1_intervalo: string;
  total_horas_2_intervalo: string;
  total_horas_3_intervalo: string;
  total_horas_trabalhadas: string;
  total_horas_intervalo: string;
  total_horas_dia: string;
  userName: string;
  upset(grupo: AddGrupoUpsertModel[]): Promise<boolean>;
}
