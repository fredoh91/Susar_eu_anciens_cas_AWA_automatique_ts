import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createSubstancePt,
  donneIdSubstancePtEval_a_creer,
  estCeTabIdentique,
  donnePremiereDateEval
} from '../src/db/query.js';
import type { PoolConnection, ResultSetHeader, Pool } from 'mysql2/promise';

import {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
} from '../src/db/dbMySQL.js';

let connectionSusarEuV2: PoolConnection;
let poolSusarEuV2: Pool;
const idSusarEu: number = 4;
const TabIdSubstancePt: number[] = [9, 10];


beforeAll(async ()=>{
  poolSusarEuV2 = await createPoolSusarEuV2();
  connectionSusarEuV2 = await poolSusarEuV2.getConnection();
} );


afterAll(async () => {
  await closePoolSusarEuV2(poolSusarEuV2);
});

describe('createSubstancePt', () => {
  it('insère une nouvelle substance_pt et retourne son id', async () => {
    // Mock de la connexion et du résultat
    const mockQuery = vi.fn().mockResolvedValueOnce([
      { insertId: 42 } as ResultSetHeader,
    ]);
    const mockConnection = { query: mockQuery } as unknown as PoolConnection;

    const id = await createSubstancePt(
      mockConnection,
      'SUBSTANCE_TEST',
      123456,
      'REACTION_TEST'
    );
    expect(id).toBe(42);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO substance_pt'),
      ['SUBSTANCE_TEST', 123456, 'REACTION_TEST']
    );
  });
}); 

describe('donneIdSubstancePtEval_a_creer', () => {
  // Test temporairement désactivé car la base de données a été modifiée
  it.skip('retourne les id des substance_pt_eval à créer', async () => {
    const TabIdSubstancePt_eval_a_creer: number[] = await donneIdSubstancePtEval_a_creer(
      connectionSusarEuV2,
      idSusarEu,
      TabIdSubstancePt
    );
    expect(TabIdSubstancePt_eval_a_creer).toStrictEqual([10]);
  });
});


describe ('les deux tableaux contiennent-ils les mêmes éléments (ordre indifférent) ?', () => {
  it('retourne true si les deux tableaux contiennent les mêmes éléments (ordre indifférent)', () => {
    const TabIdSubstancePt: number[] = [9, 10];
    const TabIdSubstancePt_eval_a_creer: number[] = [10, 9];

    const retour: boolean = estCeTabIdentique(TabIdSubstancePt, TabIdSubstancePt_eval_a_creer);
    // console.log('retour', retour);
    expect(retour).toBe(true);
  });
});


describe('Donne la plus ancienne date d\'évaluation', () => {
  it('retourne l\'id de la substance_pt', async () => {
    // const idSusarEu: number = 4;
    // const datePourCompare: Date = new Date('2022-07-22T09:35:18.000Z'); 
    const idSusarEu: number = 31601;
    const datePourCompare: Date = new Date('2024-12-12T13:09:40.000Z'); 
    const premiereDateEval = await donnePremiereDateEval(connectionSusarEuV2,idSusarEu);
    // console.log('premiereDateEval', premiereDateEval);
    expect(new Date(premiereDateEval)).toEqual(datePourCompare);
  });
});
