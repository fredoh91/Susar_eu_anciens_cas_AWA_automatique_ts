import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { createSubstancePt,donneIdSubstancePtEval_a_creer, estCeTabIdentique } from '../src/db/query.js';
import type { PoolConnection, ResultSetHeader, Pool } from 'mysql2/promise';

import {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
} from '../src/db/dbMySQL.js';

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

  it('retourne les id des substance_pt_eval à créer', async () => {

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

