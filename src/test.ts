import {
  logStream , 
  logger,
  flushAndExit
} from './logs_config.ts'

import {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
} from './db/dbMySQL.js';

import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

import mysql from 'mysql2/promise';


const currentUrl = import.meta.url;
const currentDir = path.dirname(fileURLToPath(currentUrl));
const envPath = path.resolve(currentDir, '.', '.env');
dotenv.config({ path: envPath });

/**
 * Cette fonction est utilisée pour les tests, elle pourra etre supprimée quand le script sera en PROD
 * @param {number} length - Longueur de la chaîne à générer
 * @returns {string} Chaîne aléatoire générée
 */
function generateRandomString(length: number = 4): string {
  const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result: string = '';
  const charactersLength: number = characters.length;

  for (let i: number = 0; i < length; i++) {
    const randomIndex: number = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

function donneformattedDate(): string {
  const now: Date = new Date();

  const year: number = now.getFullYear();
  const month: string = String(now.getMonth() + 1).padStart(2, '0');
  const day: string = String(now.getDate()).padStart(2, '0');
  const hours: string = String(now.getHours()).padStart(2, '0');
  const minutes: string = String(now.getMinutes()).padStart(2, '0');
  const seconds: string = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Il serait utile de définir des interfaces pour les types de connexion
interface CodexConnection {
  query: (sql: string) => Promise<any[]>;
}

type CodexPool = mysql.Pool | odbc.Pool;

const main = async (): Promise<void> => {
  logger.info('Début import : CODEX => CODEX_extract');
  
  const poolCodexExtract = await createPoolCodexExtract();
  const connectionCodexExtract = await poolCodexExtract.getConnection();
  
  const poolCodexOdbc = await createPoolCodexOdbc();
  const connectionCodexOdbc = await poolCodexOdbc.connect();
  
  const sSQL_select: string = donneSQL_select("'60051704'");

  interface CodexResult {
    nomVU: string;
    [key: string]: any;
  }

  const results: CodexResult[] = await connectionCodexOdbc.query(sSQL_select);
  if (results.length > 0) {
    console.log('Results:', results[0]['nomVU']);
    const conv: string = iconv.decode(Buffer.from(results[0]['nomVU'], 'binary'), 'utf8');
    console.log('Converted:', conv);
  }

  await connectionCodexExtract.query('COMMIT');
  await connectionCodexOdbc.query('COMMIT');

  await poolCodexExtract.connect().then(conn => conn.query('CLOSE'));
  await poolCodexOdbc.connect().then(conn => conn.query('CLOSE')); 

  logger.info('Fin import : CODEX => CODEX_extract');
}

main()