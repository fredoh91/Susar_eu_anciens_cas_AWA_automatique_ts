import logrotateStream from 'logrotate-stream';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino, { LoggerOptions, Logger } from 'pino';


// FCallback pour calculer la prochaine date de rotation
function getNextRotationDate(currentDate) {
  const nextDate = new Date(currentDate);
  nextDate.setMonth(nextDate.getMonth() + 1); // Ajoute un mois
  return nextDate;
}


// Spécifiez le répertoire des fichiers de journal
// const currentUrl = import.meta.url;
// const currentDir = path.dirname(fileURLToPath(currentUrl));
// const currentDir = __dirname;
const currentDir = path.dirname(fileURLToPath(import.meta.url));
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

// Utiliser pino() pour instancier les loggers
const logger: Logger = (pino as any)({
  level: 'debug', // level: niveau de log minimal
  timestamp: () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const formattedTime = formatter.format(now).replace(',', ''); // Supprime la virgule
    return `,"time":"${formattedTime}"`;
  }
}, logStream);

const flushAndExit = (code) => {
  logStream.flushSync();
  process.exit(code);
}

// === LOGGER DE TEST ===
const testLogFilePath = path.join(logDirectory, 'test.log');

// Vérifie si le fichier de log de test existe, sinon le créer
if (!fs.existsSync(testLogFilePath)) {
  try {
    fs.writeFileSync(testLogFilePath, '');
  } catch (error) {
    console.error('Erreur lors de la création du fichier de log de test :', error);
    process.exit(1);
  }
}

const testLogger: Logger = (pino as any)({
  level: 'debug',
  timestamp: () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('fr-FR', {
      timeZone: 'Europe/Paris',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const formattedTime = formatter.format(now).replace(',', '');
    return `,"time":"${formattedTime}"`;
  }
}, pino.destination({
  dest: testLogFilePath,
  sync: false
}));


// Exporter les instances de stream et logger
export { logStream, logger, flushAndExit, testLogger };


