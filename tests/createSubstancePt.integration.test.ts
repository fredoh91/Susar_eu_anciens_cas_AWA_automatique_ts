import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createSubstancePt } from '../src/db/query.js';
import { runInTransaction, closeTestPool } from '../src/db/testDb.js';
import type { PoolConnection } from 'mysql2/promise';

describe('createSubstancePt - Integration Test', () => {
  afterAll(async () => {
    await closeTestPool();
  });

  it('insère vraiment une substance_pt et retourne son id', async () => {
    const result = await runInTransaction(async (connection: PoolConnection) => {
      // Test avec des données réelles
      const substanceName = 'PARACETAMOL_TEST';
      const codeMeddraPt = 999999;
      const reactionMeddraPt = 'HEADACHE_TEST';
      
      console.log('🔍 Avant INSERT - Vérification que la substance n\'existe pas...');
      
      // Vérifier que la substance n'existe pas avant l'insert
      const [existingRows] = await connection.query(
        'SELECT * FROM substance_pt WHERE active_substance_high_level = ? AND codereactionmeddrapt = ?',
        [substanceName, codeMeddraPt]
      );
      
      console.log(`📊 Substances existantes trouvées: ${(existingRows as any[]).length}`);
      
      // Faire l'INSERT via notre fonction
      console.log('🚀 Exécution de createSubstancePt...');
      const newId = await createSubstancePt(
        connection,
        substanceName,
        codeMeddraPt,
        reactionMeddraPt
      );
      
      console.log(`✅ ID retourné par createSubstancePt: ${newId}`);
      
      // Vérifier que l'INSERT a bien fonctionné
      console.log('🔍 Vérification de l\'INSERT...');
      const [insertedRows] = await connection.query(
        'SELECT * FROM substance_pt WHERE id = ?',
        [newId]
      );
      
      const insertedRow = (insertedRows as any[])[0];
      console.log('📋 Données insérées:', {
        id: insertedRow?.id,
        substance: insertedRow?.active_substance_high_level,
        code: insertedRow?.codereactionmeddrapt,
        reaction: insertedRow?.reactionmeddrapt,
        created_at: insertedRow?.created_at
      });
      
      // Assertions
      expect(newId).toBeTypeOf('number');
      expect(newId).toBeGreaterThan(0);
      expect(insertedRow).toBeDefined();
      expect(insertedRow.active_substance_high_level).toBe(substanceName);
      expect(insertedRow.codereactionmeddrapt).toBe(codeMeddraPt);
      expect(insertedRow.reactionmeddrapt).toBe(reactionMeddraPt);
      
      return { newId, insertedRow };
    });
    
    console.log('🎉 Test terminé avec succès!');
    console.log(`📝 Résumé: Substance créée avec l'ID ${result.newId}`);
  });
}); 