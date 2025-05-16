import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';


// import 'dotenv/config'
import dotenv from 'dotenv';

// const envPath = path.resolve(__dirname, '..', '.env');
const currentDir = __dirname;
const envPath = path.resolve(currentDir, '..', '.env');
dotenv.config({ path: envPath });


// -------------------------------------------------------------------------------
// --            Création d'un pool de connexion pour la base SUSAR_EU_v2     --
// -------------------------------------------------------------------------------
/**
 * 
 * @returns pool
 */
async function createPoolSusarEuV2() {
  try {
    const pool = mysql.createPool({
      host: process.env.SUSAR_EU_V2_HOST,
      user: process.env.SUSAR_EU_V2_USER,
      password: process.env.SUSAR_EU_V2_PASSWORD,
      database: process.env.SUSAR_EU_V2_DATABASE,
      charset: 'utf8mb4'
    });
    console.log('Pool BDD SUSAR_EU_v2 ouvert');

    return pool;
  } catch (err) {
    console.error('Erreur à la connexion de SUSAR_EU_v2 :', err);
    throw err;
  }
}



// -------------------------------------------------------------------------------
// --                          Ferme le pool SUSAR_EU_v2                      --
// -------------------------------------------------------------------------------
/**
 * 
 * @param {*} pool : pool vers SUSAR_EU qui sera fermé
 */
async function closePoolSusarEuV2(pool) {
  try {
    console.log('Fermeture du pool vers la BDD SUSAR_EU_v2');
    pool.end();
  } catch (err) {
    console.error('Erreur à la fermeture de la connexion de SUSAR_EU_v2 :', err);
    throw err;
  }
};

export {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
};

