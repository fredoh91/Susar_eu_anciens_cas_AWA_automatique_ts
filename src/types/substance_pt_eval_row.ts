import type { RowDataPacket } from 'mysql2/promise';

export type SubstancePtEvalRow = RowDataPacket & {
  id: number;
  changes: string;
  assessment_outcome: string;
  comments: string;
  date_eval: string | Date;
  user_create: string;
  user_modif: string;
  created_at: string | Date;
  updated_at: string | Date;
};
