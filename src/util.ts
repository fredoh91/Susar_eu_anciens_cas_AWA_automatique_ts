
/**
 * Cette fonction est utilisée pour les tests, elle pourra être supprimée quand le script sera en PROD
 * Elle permet de générer une chaîne de caractères aléatoire de caractères de longueur spécifiée (par défaut 4 caractères)
 * Elle était utilisée pour générer des identifiants aléatoires pour des INSERT pour les tests
 * 
 * @param {number} length - Longueur de la chaîne de caractères à générer
 * @returns {string} - Chaîne de caractères aléatoire
 */
function generateRandomString(length: number = 4): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters[randomIndex];
  }

  return result;
}

/**
 * Cette fonction retourne une chaîne de caractère formatée en TIMESTAMP pour la date et l'heure
 * Elle permet de stocker la date et l'heure d'export CODEX
 * 
 * @returns {string} - Chaîne de caractère formatée en TIMESTAMP
 */
function donneformattedDate(): string {
  const now = new Date();

  // Utiliser des méthodes pour obtenir la date et l'heure locales
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export {
  generateRandomString,
  donneformattedDate,
};
