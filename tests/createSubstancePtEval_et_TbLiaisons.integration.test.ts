import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createSubstancePtEval_et_TbLiaisons } from '../src/db/query.js';
import { runInTransaction, closeTestPool, getTestConnection } from '../src/db/testDb.js';
import type { PoolConnection } from 'mysql2/promise';

// Ce test suppose que les tables substance_pt, susar_eu, etc. existent et qu'il y a au moins une entrée dans chacune

describe('createSubstancePtEval_et_TbLiaisons - Integration Test', () => {
  beforeAll(async () => {
    await getTestConnection();
  });

  afterAll(async () => {
    await closeTestPool();
  });

  it('insère les données dans les 3 tables et rollback à la fin', async () => {
    await runInTransaction(async (connection: PoolConnection) => {
      // Préparer des IDs valides pour substance_pt et susar_eu
      const [substanceRows] = await connection.query('SELECT id FROM substance_pt LIMIT 1');
      const [susarRows] = await connection.query('SELECT id FROM susar_eu LIMIT 1');
      const idSubstancePt = (substanceRows as any[])[0]?.id;
      const idSusar = (susarRows as any[])[0]?.id;
      expect(idSubstancePt).toBeDefined();
      expect(idSusar).toBeDefined();

      // Appel de la fonction à tester
      await createSubstancePtEval_et_TbLiaisons(connection, idSubstancePt, idSusar);

      // Vérification en une seule requête jointe
      const [joinedRows] = await connection.query(
        `SELECT * 
         FROM substance_pt_eval_susar_eu s 
         INNER JOIN substance_pt_eval s2 ON s2.id = s.substance_pt_eval_id
         INNER JOIN substance_pt_eval_substance_pt s3 ON s3.substance_pt_eval_id = s2.id
         WHERE s.susar_eu_id = ?
         AND s3.substance_pt_id = ?
         ORDER BY s2.id DESC LIMIT 1`,
        [idSusar, idSubstancePt]
      );
      expect((joinedRows as any[]).length).toBeGreaterThan(0);
      const row = (joinedRows as any[])[0];
      expect(row.susar_eu_id).toBe(idSusar);
      // expect(row.susar_eu_id).toBe(15242);
      expect(row.substance_pt_id).toBe(idSubstancePt);
    });
  });
}); 