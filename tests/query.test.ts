import { describe, it, expect, vi } from 'vitest';
import { createSubstancePt } from '../src/db/query.js';
import type { PoolConnection, ResultSetHeader } from 'mysql2/promise';

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