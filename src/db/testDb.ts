import mysql from 'mysql2/promise';
import type { PoolConnection } from 'mysql2/promise';
import { testLogger } from '../logs_config.js';

// Configuration pour la base de données de test
const testDbConfig = {
  host: process.env.SUSAR_EU_V2_TEST_HOST ,
  user: process.env.SUSAR_EU_V2_TEST_USER ,
  password: process.env.SUSAR_EU_V2_TEST_PASSWORD ,
  database: process.env.SUSAR_EU_V2_TEST_NAME ,
  port: parseInt(process.env.SUSAR_EU_V2_TEST_PORT ),
};

let testPool: mysql.Pool | null = null;

export async function getTestConnection(): Promise<PoolConnection> {
  if (!testPool) {
    testPool = mysql.createPool(testDbConfig);
  }
  return await testPool.getConnection();
}

export async function closeTestPool(): Promise<void> {
  if (testPool) {
    await testPool.end();
    testPool = null;
  }
}

// Fonction utilitaire pour exécuter un test dans une transaction
export async function runInTransaction<T>(
  testFunction: (connection: PoolConnection) => Promise<T>
): Promise<T> {
  const connection = await getTestConnection();
  
  try {
    // Commencer la transaction
    await connection.beginTransaction();
    
    // Exécuter le test
    const result = await testFunction(connection);
    // console.log('result', result);
    // Exemple d'utilisation du logger de test :
    testLogger.info({ result }, 'Résultat du test exécuté dans runInTransaction');
    // Rollback pour annuler les changements
    await connection.rollback();
    
    return result;
  } finally {
    // Toujours libérer la connexion
    connection.release();
  }
} 