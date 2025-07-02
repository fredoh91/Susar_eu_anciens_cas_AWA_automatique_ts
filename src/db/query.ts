import { 
  logger,
} from '../logs_config.js'


import type { SusarEuRow } from '../types/susar_eu_row';
import type { PoolConnection, Pool } from 'mysql2/promise';

async function trtLotSusarEu(connectionSusarEuV2: PoolConnection, lstSusarEu: SusarEuRow[]): Promise<void> {
    if (lstSusarEu.length !== 0) {

        for (const SusarEu of lstSusarEu) {
            logger.info(`Traitement du cas : ${SusarEu.id}`);
            // TODO : Traiter le cas ici
            // await traiterCas(SusarEu);

            // on va chercher les medicament suspect de ce susar
            // on va chercher les PT de ce susar
            // on fait une double boucle for of medicamentSuspect et PT
            // pour chacun des couples, on regarde si il y a un enregistrement dans la table substance_pt
            //      si oui, on recupère l'id de cette ligne substance_pt
            //      si non, on crée la ligne et on recupère l'id de cette ligne substance_pt. 
            //              on crée également les lignes dans la table de liaison "substance_pt_susar_eu" .
            //              Normalement cela ne doit pas arriver
            //      on vérifie qu'il n'y a aucun substance_pt_eval pour tous les couples medicamentSuspect et PT
            //      si il y a des évaluations, on log et on ne traite pas ce susar
            //      si il n'y a pas d'évaluation : 
            //              on crée la ligne dans la table substance_pt_eval : 
            //                          - assessment outcome : screened without action
            //                          - comments : Screened without action automatic ()
            //                          - date_eval : date d'aujourd'hui
            //              on modifie la ligne susar_eu : date_evaluation : now

        }
    }
}


export {
    trtLotSusarEu,
}
//     logger.info('SWA automatique : Fin traitement');