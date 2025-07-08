import type { RowDataPacket } from 'mysql2/promise';

export type MedicamentsRow = RowDataPacket & {
  id: number;
  susar_id: number;
  master_id: number;
  caseid: number;
  specificcaseid: string;
  dlpversion: number;
  productcharacterization: string;
  productname: string;
  nbblock: number;
  substancename: string;
  created_at: string | Date;
  updated_at: string | Date;
  nbblock2: number;
  active_substance_high_level: string;
  intervenant_substance_dmm_id: number;
  association_de_substances: boolean; // tinyint(1) → boolean (ou number si tu préfères)
  nom_produit_brut: string;
  maladie: string;
  statut_medic_apres_effet: string;
  date_derniere_admin: string;
  date_derniere_admin_format_date: string | Date;
  delai_administration_survenue: string;
  dosage: string;
  voie_admin: string;
  comment: string;
  type_sa_ms_mono: string;
  substancename_avant_modif_attrib_productname: string;
};
