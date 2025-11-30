/**
 * Analyse un message de confirmation Airtel Money pour extraire le montant et l'ID de transaction.
 * Format supposé: "Trans. ID: PP230523.1545.H89999. Vous avez envoyé 5000 FCFA à..."
 * Ou format français: "Id de la transaction: PP230523.1545.H89999. Vous avez envoyé 5000 FCFA à..."
 * 
 * @param {string} message - Le message SMS complet
 * @returns {object} - { success: boolean, amount: number, transactionId: string, error: string }
 */
function parseAirtelMessage(message) {
    if (!message) {
        return { success: false, error: "Message vide" };
    }

    // Nettoyage basique
    const cleanMessage = message.trim();

    // Regex pour trouver l'ID de transaction (Format flexible: PP + chiffres/lettres ou similaire)
    // Ex: Trans. ID: PP230523.1545.H89999
    const txIdRegex = /(?:Trans\. ID|Id de la transaction|Tx ID)\s*[:.]?\s*([A-Za-z0-9.]+)/i;
    const txMatch = cleanMessage.match(txIdRegex);

    // Regex pour trouver le montant envoyé
    // Ex: envoyé 5000 FCFA ou sent 5000 FCFA
    const amountRegex = /(?:envoyé|sent|transfert de)\s*(\d+(?:[.,]\d+)?)\s*(?:FCFA|XAF)/i;
    const amountMatch = cleanMessage.match(amountRegex);

    // Regex pour vérifier le destinataire (optionnel mais recommandé)
    // Le numéro cible est +24177765496 ou 077765496
    const receiverRegex = /(?:à|to)\s*(?:M\.|Mme)?\s*.*?(\d{9}|77765496)/i;
    const receiverMatch = cleanMessage.match(receiverRegex);

    // Validation
    if (!txMatch) {
        return { success: false, error: "ID de transaction introuvable" };
    }
    if (!amountMatch) {
        return { success: false, error: "Montant introuvable" };
    }

    // Si on veut être strict sur le destinataire:
    // if (!receiverMatch || !receiverMatch[1].includes('77765496')) {
    //     return { success: false, error: "Destinataire incorrect ou introuvable" };
    // }

    const transactionId = txMatch[1];
    const amount = parseFloat(amountMatch[1].replace(',', '.'));

    return {
        success: true,
        transactionId,
        amount
    };
}

module.exports = { parseAirtelMessage };
