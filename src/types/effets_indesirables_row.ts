import type { RowDataPacket } from 'mysql2/promise';

export type EffetsIndesirablesRow = RowDataPacket & {
  id: number;
  susar_id: number;
  master_id: number;
  caseid: number;
  specificcaseid: string;
  dlpversion: number;
  reactionstartdate: string | Date;
  reactionmeddrallt: string;
  codereactionmeddrallt: number;
  reactionmeddrapt: string;
  codereactionmeddrapt: number;
  reactionmeddrahlt: string;
  codereactionmeddrahlt: number;
  reactionmeddrahlgt: string;
  codereactionmeddrahlgt: number;
  soc: string;
  reactionmeddrasoc: number;
  created_at: string | Date;
  updated_at: string | Date;
  reaction_list_pt_ctll: string;
  reaction_list_pt: string;
  outcome: string;
  date: string;
  date_format_date: string | Date;
  duration: string;
};
