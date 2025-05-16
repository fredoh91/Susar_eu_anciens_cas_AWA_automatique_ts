import pino from 'pino';
import logrotateStream from 'logrotate-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';


// FCallback pour calculer la prochaine date de rotation
function getNextRotationDate(currentDate) {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1); // Ajoute un mois
    return nextDate;
  }


// Spécifiez le répertoire des fichiers de journal
// Utilisez __dirname pour obtenir le répertoire courant en CommonJS
const currentDir = __dirname;
const logDirectory = path.resolve(currentDir, '../logs');
// const logDirectory = '../logs';
const prefixFichierLog = "CODEX_extract"

// Créez le répertoire s'il n'existe pas
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

// Obtenez la date actuelle au format 'YYYY-MM' (année-mois) en utilisant les méthodes natives de l'objet Date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0'); // Ajoute un zéro devant si nécessaire
// Spécifiez le chemin du fichier de journal avec l'année et le mois
const logFile = `${prefixFichierLog}_${currentYear}-${currentMonth}.log`;

const logFilePath = path.join(logDirectory, logFile);

// Vérifie si le fichier de journal existe, sinon le créer
if (!fs.existsSync(logFilePath)) {
    try {
      // Crée le fichier de journal s'il n'existe pas
      fs.writeFileSync(logFilePath, '');
    } catch (error) {
      console.error('Erreur lors de la création du fichier de journal :', error);
      process.exit(1); // Arrêter le processus en cas d'erreur
    }
  }

// Créez un flux de rotation des journaux
const logStream = logrotateStream({
    file: logFilePath,
    size: '10M', // Taille maximale du fichier de journal avant rotation
    rotate: getNextRotationDate, // Fonction de rappel pour la rotation mensuelle
    // keep: 12, // Nombre de fichiers de journal à conserver (pour un mois)
    compress: true // Compression des fichiers de journal archivés
  });


const logger = pino.default({
    level: 'debug', // level: niveau de log minimal
    // level: 'info', 
  }, logStream);

  const flushAndExit = (code) => {
    logStream.flushSync(); 
    process.exit(code);
  }


  
// Exporter les instances de stream et logger
export { logStream , logger , flushAndExit };


