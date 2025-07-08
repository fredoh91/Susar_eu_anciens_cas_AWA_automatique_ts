import type { RowDataPacket } from 'mysql2/promise';

export type SubstancePtRow = RowDataPacket & {
  id: number;
  active_substance_high_level: string;
  codereactionmeddrapt: number;
  reactionmeddrapt: string;
  created_at: string | Date;
  updated_at: string | Date;
};
