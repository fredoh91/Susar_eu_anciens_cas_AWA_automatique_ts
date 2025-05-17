import { 
  logger,
} from './logs_config.js'

import {
  createPoolSusarEuV2,
  closePoolSusarEuV2,
} from './db/dbMySQL.js';
// import {
//   donneformattedDate,
// } from './util.js'

import path from 'path';
import { fileURLToPath } from 'url';

import dotenv from 'dotenv';

// types ts personnalisé
import type { SusarEuRow } from './types/susar_eu_row';



// Use __dirname for CommonJS compatibility
const currentDir = __dirname;
const envPath = path.resolve(currentDir, '..', '.env');
dotenv.config({ path: envPath });

// Nombre total de lignes à traiter pour les tests
// const NB_CODEVU_A_TRAITER_PAR_LOT = parseInt(process.env.NB_CODEVU_A_TRAITER_PAR_LOT, 10) || 100;

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
  
  const poolSusarEuV2 = await createPoolSusarEuV2();
  const connectionSusarEuV2 = await poolSusarEuV2.getConnection();

    // const batchSize: number = 10;
    const batchSize: number = Number(process.env.NB_SUSAR_A_TRAITER_PAR_LOT);
    let offset: number = 0;
    let hasMore: boolean = true;

    while (hasMore) {
        const query: string = `SELECT * 
                                FROM susar_eu se 
                                WHERE se.date_evaluation is null
                                ORDER BY se.created_at 
                                LIMIT ${batchSize} 
                                OFFSET ${offset}`;
        const [rows] = await connectionSusarEuV2.query<SusarEuRow[]>(query);
        console.log(rows.length);
        // process.exit(0);
        if (rows.length === 0) {
            hasMore = false;
            break;
        }

        // Traiter le bloc de résultats ici
        console.log(`Traitement du bloc de ${offset} à ${offset + rows.length}`);
        // Ajoutez ici votre logique de traitement pour chaque bloc

        offset += batchSize;
    }
  // const evals = await donneEvalSubstance(poolSusarDataOdbc);
  // console.log(evals);
  // permet de couper la liste des codeVU à traiter en lots de NB_CODEVU_A_TRAITER_PAR_LOT
  // const lstCodeVU = await donneTabCodeVU (connectionCodexOdbc,NB_CODEVU_A_TRAITER_PAR_LOT);

  // const promises_trtCodeVU: Promise<void>[] = lstCodeVU.map((codeVUArray: string[], index: number): Promise<void> => {
  //   return trtLotCodeVU(codeVUArray, connectionCodexOdbc, connectionCodexExtract, formattedDate);
  // });

  // pour attendre la fin de tous les traitements trtLotCodeVU
  // await Promise.all(promises_trtCodeVU);

  
  await closePoolSusarEuV2(poolSusarEuV2);

  logger.info('SWA automatique : Fin traitement');
  
  }
  
  main()