type IUpsert = {
  periodoId: number;
  entrada: Date;
  saida: Date;
  cartao_dia_id: number;
  statusId: number;
};

export interface LancarDia {
  upsert(input: IUpsert): Promise<boolean>;
}
