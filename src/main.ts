import { 
  logger,
} from './logs_config.js'

import {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
} from './db/dbMySQL.js';

import {
  trtLotSusarEu,
} from './db/query.js';


import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

// types ts personnalisé
import type { SusarEuRow } from './types/susar_eu_row.js';
import type { PoolConnection, Pool, RowDataPacket } from 'mysql2/promise';

// const currentDir = __dirname;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(currentDir, '..', '.env');
dotenv.config({ path: envPath });

/**
 * Fonction principale
 */
const main = async (): Promise<void> => {

  if (process.env.TYPE_EXECUTION == 'Prod') {
    process.on('uncaughtException', (err) => {
      const stackLines = err.stack.split('\n');
      const location = stackLines[1].trim();
      logger.error(`Uncaught Exception: ${err.message}`);
      logger.error(`Location: ${location}`);
      logger.error(err.stack);
    });
  
    process.on('unhandledRejection', (reason, promise) => {
      const stackLines = (reason as Error).stack.split('\n');
      const location = stackLines[1].trim(); // Typically, the second line contains the location
      logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      logger.error(`Location: ${location}`);
      logger.error((reason as Error).stack);
    });
  }
  
  logger.info('SWA automatique : Début traitement');
  
  const poolSusarEuV2: Pool = await createPoolSusarEuV2();
  const connectionSusarEuV2: PoolConnection = await poolSusarEuV2.getConnection();
  const nbJoursSeuil:string = process.env.NB_JOURS_SEUIL_DATE_IMPORT
  const batchSize: number = Number(process.env.NB_SUSAR_A_TRAITER_PAR_LOT);
  const promises_trtLotSusarEu: Promise<void>[] = [];

  // 1. Récupérer tous les IDs à traiter
  const [idRows] = await connectionSusarEuV2.query<RowDataPacket[]>(
    `SELECT id FROM susar_eu se 
      WHERE se.date_evaluation IS NULL
        AND se.created_at <= DATE_SUB(CURDATE(), INTERVAL ${nbJoursSeuil} DAY)
      ORDER BY se.created_at`
  );
  const allIds = idRows.map((row: any) => row.id);

  // 2. Itérer sur le tableau d'IDs par lots
  for (let i = 0; i < allIds.length; i += batchSize) {

    // 3. Créer la chaîne d'IDs pour la requête IN
    const batchIds = allIds.slice(i, i + batchSize);
    if (batchIds.length === 0) continue;
    const idsString = batchIds.join(",");

    // 4. Faire la requête pour récupérer les lignes du lot
    const query = `SELECT * FROM susar_eu se WHERE se.id IN (${idsString})`;
    const [rows] = await connectionSusarEuV2.query<SusarEuRow[]>(query);

    // 5. Appeler le traitement sur le lot
    promises_trtLotSusarEu.push(trtLotSusarEu(connectionSusarEuV2, rows));
  }

  await Promise.all(promises_trtLotSusarEu);

  
  await closePoolSusarEuV2(poolSusarEuV2);

  logger.info('SWA automatique : Fin traitement');
  
  }
  
  main()