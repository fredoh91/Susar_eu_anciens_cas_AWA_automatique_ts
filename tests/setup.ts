import { config } from 'dotenv';
import { resolve } from 'path';

// Charger les variables d'environnement depuis .env
config();

// Configuration par défaut si les variables n'existent pas
if (!process.env.SUSAR_EU_V2_TEST_HOST) {
  process.env.SUSAR_EU_V2_TEST_HOST = 'localhost';
  process.env.SUSAR_EU_V2_TEST_USER = 'root';
  process.env.SUSAR_EU_V2_TEST_PASSWORD = '';
  process.env.SUSAR_EU_V2_TEST_NAME = 'susar_eu_v2_test';
  process.env.SUSAR_EU_V2_TEST_PORT = '3306';
}

// console.log('🧪 Configuration de test chargée:', {
//   host: process.env.SUSAR_EU_V2_TEST_HOST,
//   user: process.env.SUSAR_EU_V2_TEST_USER,
//   database: process.env.SUSAR_EU_V2_TEST_NAME,
//   port: process.env.SUSAR_EU_V2_TEST_PORT
// }); 