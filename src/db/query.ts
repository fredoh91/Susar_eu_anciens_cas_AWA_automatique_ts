import { 
  logger,
} from '../logs_config.js'


import type { SusarEuRow } from '../types/susar_eu_row.js';
import type { MedicamentsRow } from '../types/medicaments_row.js';
import type { EffetsIndesirablesRow } from '../types/effets_indesirables_row.js';
import type { SubstancePtRow } from '../types/substance_pt_row.js';
import type { SubstancePtEvalRow } from '../types/substance_pt_eval_row.js';
import type { PoolConnection, Pool } from 'mysql2/promise';
import type { ResultSetHeader } from 'mysql2/promise';

async function trtLotSusarEu(connectionSusarEuV2: PoolConnection, lstSusarEu: SusarEuRow[]): Promise<void> {
    if (lstSusarEu.length !== 0) {

        for (const SusarEu of lstSusarEu) {
            logger.info(`Traitement du cas : ${SusarEu.id}`);
            // TODO : Traiter le cas ici
            // await traiterCas(SusarEu);

            // on va chercher les medicament suspect de ce susar
            const medicamentSuspect: MedicamentsRow[] = await donneMedics(connectionSusarEuV2, SusarEu.id);
            if (medicamentSuspect.length === 0) {   
                logger.info(`Aucun medicament suspect pour le cas : ${SusarEu.id}`);
                continue; // on passe au susar suivant
            }
            // on va chercher les PT de ce susar
            const effetsIndesirables: EffetsIndesirablesRow[] = await donneEIs(connectionSusarEuV2, SusarEu.id);
            if (effetsIndesirables.length === 0) {
                logger.info(`Aucun effet indésirable pour le cas : ${SusarEu.id}`);
                continue; // on passe au susar suivant
            }
            // on fait une double boucle for of medicamentSuspect et PT
            let TabIdSubstancePt: number[] = [];
            for (const medicament of medicamentSuspect) {
                for (const effet of effetsIndesirables) {
                    const idSubstancePt = await donneSubstancePt(connectionSusarEuV2, SusarEu.id, medicament, effet);
                    if (idSubstancePt !== null) {
                        TabIdSubstancePt.push(idSubstancePt);
                    }
                    // pour chacun des couples, on regarde si il y a un enregistrement dans la table substance_pt
                    //      si oui, on recupère l'id de cette ligne substance_pt
                    //      si non, on crée la ligne et on recupère l'id de cette ligne substance_pt. 
                    //              on crée également les lignes dans la table de liaison "substance_pt_susar_eu" .
                    //              Normalement cela ne doit pas arriver
                }
            }

            // console.log('SusarEu.id', SusarEu.id);  //  ex. 4
            // console.log(TabIdSubstancePt);     //  ex. [ 9, 10 ]
            // process.exit(0);

            const TabIdSubstancePt_eval_a_creer: number[] = await donneIdSubstancePtEval_a_creer(
                                                                                        connectionSusarEuV2, 
                                                                                        SusarEu.id, 
                                                                                        TabIdSubstancePt);


            console.log ('idSusarEu', SusarEu.id);
            console.log('TabIdSubstancePt_eval_a_creer', TabIdSubstancePt_eval_a_creer);
            console.log('tableau identique',estCeTabIdentique(TabIdSubstancePt, TabIdSubstancePt_eval_a_creer))



            // si on a estCeTabIdentique a false c'est qu'il y a bien au moins une eval, mais que la date d'eval, n'est pas renseignée dans la table susar_eu, 
            // il faut donc récupérer la date la plus ancienne dans la table substance_pt_eval_susar_eu et la mettre dans la table susar_eu.dateeval

            // sinon il faut crée toutes les éval comme décrit plus bas


            // process.exit(0);    
            //      on vérifie qu'il n'y a aucun substance_pt_eval pour tous les couples medicamentSuspect et PT
            //      On parcours substance_pt_eval_susar_eu INNER JOIN substance_pt_eval 
            //           Pour chaque substance_pt_eval, on vérifie si il y a une ligne dans substance_pt_eval_substance_pt
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

async function donneMedics(connectionSusarEuV2: PoolConnection,idSusar: number): Promise<MedicamentsRow[]> {
    const query: string = `SELECT * FROM medicaments m WHERE (m.productcharacterization ='Suspect' or m.productcharacterization ='Interacting')
                            and m.susar_id = ?`;

    const [rows] = await connectionSusarEuV2.query<MedicamentsRow[]>(query, [idSusar]);

    if (rows.length === 0) {
        return [];
    }

    return rows;
}

async function donneEIs(connectionSusarEuV2: PoolConnection,idSusar: number): Promise<EffetsIndesirablesRow[]> {
    const query: string = `SELECT * FROM effets_indesirables ei where ei.susar_id = ?`;

    const [rows] = await connectionSusarEuV2.query<EffetsIndesirablesRow[]>(query, [idSusar]);

    if (rows.length === 0) {
        return [];
    }

    return rows;
}

async function donneSubstancePt(connectionSusarEuV2: PoolConnection,
                                idSusar: number,
                                medic: MedicamentsRow,
                                EI: EffetsIndesirablesRow): Promise<number|null> {

    const query: string = `SELECT sp.* 
                            FROM susar_eu_v2.substance_pt_susar_eu sps 
                            INNER JOIN susar_eu_v2.substance_pt sp ON sps.substance_pt_id = sp.id
                            WHERE sps.susar_eu_id = ?`;

    const [rows] = await connectionSusarEuV2.query<SubstancePtRow[]>(query, [idSusar]);

    if (rows.length === 0) {
        // On ne trouve pas de substance_pt pour ce susar, on le crée et on retourne son id
        logger.info(`Aucune substance trouvée pour le susar ${idSusar} avec substance ${medic.substancename} et MedDRA PT ${EI.reaction_list_pt}, on va le créer`);

        // Créer la substance_pt et retourner son id
        const newSubstanceId = await createSubstancePt(connectionSusarEuV2, medic.substancename, EI.codereactionmeddrapt, EI.reaction_list_pt);
        
        if (newSubstanceId === null) {
            return null;
        }
        // on crée la ligne dans la table de liaison "substance_pt_susar_eu" .
        const query: string = `INSERT INTO substance_pt_susar_eu (substance_pt_id, susar_eu_id) VALUES (?, ?)`;


        await createSubstancePtSusarEu(connectionSusarEuV2, newSubstanceId, idSusar);

        return newSubstanceId;
    }
    // On parcours les resultats pour filtrer par substanceName et codeMeddraPt
    const filteredRows = rows.filter(row => 
        row.active_substance_high_level === medic.substancename && 
        row.codereactionmeddrapt === EI.codereactionmeddrapt
    );

    if (filteredRows.length === 0) {
        // return [];
    } else if (filteredRows.length > 1) {
        logger.warn(`Plusieurs substances trouvées pour le susar ${idSusar} avec substance ${medic.substancename} et MedDRA PT ${EI.reaction_list_pt}`);
        return null;
    }
    return filteredRows[0].id; // Retourne l'id de la substance trouvée
}

async function createSubstancePt(
    connectionSusarEuV2: PoolConnection,
    substanceName: string,
    codeMeddraPt: number,
    reactionMeddraPt: string
): Promise<number> {
    try {
        const query: string = `INSERT INTO substance_pt (
            active_substance_high_level, 
            codereactionmeddrapt, 
            reactionmeddrapt, 
            created_at, 
            updated_at
        ) VALUES (?, ?, ?, NOW(), NOW())`;

        const [result] = await connectionSusarEuV2.query<ResultSetHeader>(query, [
            substanceName,
            codeMeddraPt,
            reactionMeddraPt,
        ]);
        const substance_pt_id = result.insertId;
        return substance_pt_id; // Retourne l'id de la nouvelle substance_pt créée
    } catch (error) {
        logger.error({ error }, `Erreur lors de l'insertion dans substance_pt, pour la substance ${substanceName} et le PT ${reactionMeddraPt}`);
        throw error;
    }
}

async function createSubstancePtSusarEu(
    connectionSusarEuV2: PoolConnection,
    substance_pt_id: number,
    idSusar: number
): Promise<void> {
    try {
        const query: string = `INSERT INTO substance_pt_susar_eu (
            substance_pt_id, 
            susar_eu_id
        ) VALUES (?, ?)`;

        await connectionSusarEuV2.query<ResultSetHeader>(query, [
            substance_pt_id,
            idSusar,
        ]);
    } catch (error) {
        logger.error({ error }, `Erreur lors de l'insertion dans substance_pt_susar_eu, pour l'id_substance_pt ${substance_pt_id} et l' idsusar ${idSusar}`);
        throw error;
    }
}

async function donneIdSubstancePtEval_a_creer(
    connectionSusarEuV2: PoolConnection, 
    idSusarEu: number, 
    TabIdSubstancePt: number[]
): Promise<number[]> {


let TabIdSubstancePtEval: number[] = [];
for (const idSubstancePt of TabIdSubstancePt) {
    // const query: string = `SELECT * FROM substance_pt_eval WHERE substance_pt_id = ?`;
    const query: string = `SELECT * 
                            FROM substance_pt_eval_susar_eu s 
                            INNER JOIN substance_pt_eval s2 ON s2.id = s.substance_pt_eval_id
                            INNER JOIN substance_pt_eval_substance_pt s3 ON s3.substance_pt_eval_id = s2.id
                            WHERE s.susar_eu_id = ?
                            AND s3.substance_pt_id = ?;`;

    const [rows] = await connectionSusarEuV2.query<SubstancePtEvalRow[]>(query, [idSusarEu,idSubstancePt]);

    if (rows.length === 0) {
        TabIdSubstancePtEval.push(idSubstancePt);
    }
}

    return TabIdSubstancePtEval;
}


function estCeTabIdentique(TabIdSubstancePt: number[], TabIdSubstancePt_eval_a_creer: number[]): boolean {
  if (TabIdSubstancePt.length !== TabIdSubstancePt_eval_a_creer.length) return false;
  const sortedA = [...TabIdSubstancePt].sort((a, b) => a - b);
  const sortedB = [...TabIdSubstancePt_eval_a_creer].sort((a, b) => a - b);
  return sortedA.every((val, idx) => val === sortedB[idx]);
}


export {
    trtLotSusarEu,
    createSubstancePt,
    donneIdSubstancePtEval_a_creer,
    estCeTabIdentique,
}
//     logger.info('SWA automatique : Fin traitement');