/**
 * Templates HTML pour les emails de notification
 * Chaque template retourne { subject, html }
 */

// Template de base pour tous les emails
const baseTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #4CAF50;
    }
    .header h1 {
      color: #4CAF50;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 20px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #45a049;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #777;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 15px;
      border-left: 4px solid #ffc107;
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌳 L'Arbre à Palabres</h1>
      <p style="color: #666; margin: 5px 0;">Concours d'Éloquence</p>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      <p>© 2024 L'Arbre à Palabres - Tous droits réservés</p>
      <p>
        <a href="https://arbre-a-palabre-9e83a.web.app" style="color: #4CAF50;">Visiter le site</a> |
        <a href="https://arbre-a-palabre-9e83a.web.app/preferences" style="color: #4CAF50;">Gérer mes préférences</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

// Template de bienvenue pour les visiteurs
const bienvenueVisiteurTemplate = (data) => {
    const { nom, prenom } = data;

    const content = `
    <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
    <p>Bienvenue dans la communauté de <strong>L'Arbre à Palabres</strong> ! 🎉</p>
    <p>Merci de vous être inscrit(e) pour recevoir nos actualités. Vous serez désormais informé(e) de :</p>
    <ul>
      <li>🎤 Nouveaux débats et thèmes</li>
      <li>🏆 Résultats des compétitions</li>
      <li>📚 Offres de formation exclusive</li>
      <li>💡 Conseils et astuces en éloquence</li>
    </ul>
    <div class="highlight">
      <strong>🎁 Offre spéciale de bienvenue !</strong><br>
      Découvrez notre formation "Éloquence Avancée" à seulement <strong>10 000 FCFA</strong>.
      <br><br>
      <a href="https://arbre-a-palabre-9e83a.web.app/formations" class="button">Découvrir la formation</a>
    </div>
    <p>À très bientôt ! 🌟</p>
  `;

    return {
        subject: '🌳 Bienvenue à L\'Arbre à Palabres !',
        html: baseTemplate('Bienvenue parmi nous !', content)
    };
};

// Template pour nouveau débat
const nouveauDebatTemplate = (data) => {
    const { debat } = data;

    const content = `
    <p>Un nouveau débat vient d'être lancé ! 🎤</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">${debat.theme}</h3>
      <p><strong>Catégorie :</strong> ${debat.categorie}</p>
      <p><strong>Date de début :</strong> ${new Date(debat.dateDebut).toLocaleDateString('fr-FR')}</p>
      ${debat.description ? `<p>${debat.description}</p>` : ''}
    </div>
    <p>Ne manquez pas cette opportunité de suivre nos orateurs talentueux !</p>
    <a href="https://arbre-a-palabre-9e83a.web.app/debats/${debat._id}" class="button">Voir le débat</a>
  `;

    return {
        subject: `🎤 Nouveau débat : ${debat.theme}`,
        html: baseTemplate('Nouveau Débat Disponible', content)
    };
};

// Template pour résultat de débat
const resultatDebatTemplate = (data) => {
    const { debat, vainqueur } = data;

    const content = `
    <p>Le débat "<strong>${debat.theme}</strong>" est terminé ! 🏆</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">🥇 Vainqueur : ${vainqueur.prenom} ${vainqueur.nom}</h3>
      <p><strong>Score final :</strong> ${vainqueur.scoreFinal} points</p>
      <p><strong>Catégorie :</strong> ${debat.categorie}</p>
    </div>
    <p>Félicitations à tous les participants pour leur performance exceptionnelle !</p>
    <a href="https://arbre-a-palabre-9e83a.web.app/debats/${debat._id}" class="button">Voir les détails</a>
  `;

    return {
        subject: `🏆 Résultats : ${debat.theme}`,
        html: baseTemplate('Résultats du Débat', content)
    };
};

// Template d'invitation à participer (pour candidats)
const invitationParticipationTemplate = (data) => {
    const { candidat, debat } = data;

    const content = `
    <p>Bonjour <strong>${candidat.prenom}</strong>,</p>
    <p>Nous avons un nouveau débat qui pourrait vous intéresser ! 🌟</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">${debat.theme}</h3>
      <p><strong>Catégorie :</strong> ${debat.categorie}</p>
      <p><strong>Votre catégorie :</strong> ${candidat.categorie}</p>
      <p><strong>Date limite d'inscription :</strong> ${new Date(debat.dateDebut).toLocaleDateString('fr-FR')}</p>
    </div>
    <p>Avec votre expérience (${candidat.nombreVictoires} victoire(s)), vous avez toutes les chances de briller ! 💪</p>
    <a href="https://arbre-a-palabre-9e83a.web.app/debats/${debat._id}/inscription" class="button">S'inscrire au débat</a>
  `;

    return {
        subject: `🎯 Invitation : ${debat.theme}`,
        html: baseTemplate('Nouveau Débat Pour Vous', content)
    };
};

// Template d'offre de formation
const offreFormationTemplate = (data) => {
    const { formation, destinataire } = data;

    const content = `
    <p>Bonjour ${destinataire.prenom || ''},</p>
    <p>Développez vos compétences en éloquence avec notre formation exclusive ! 📚</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">${formation.titre}</h3>
      <p>${formation.descriptionCourte || formation.description}</p>
      <p><strong>💰 Prix :</strong> ${formation.prix.toLocaleString('fr-FR')} FCFA</p>
      <p><strong>⏱️ Durée :</strong> ${formation.duree} heures</p>
      <p><strong>📊 Niveau :</strong> ${formation.niveauRequis}</p>
    </div>
    <p><strong>Ce que vous allez apprendre :</strong></p>
    <ul>
      ${formation.objectifs ? formation.objectifs.map(obj => `<li>${obj}</li>`).join('') : '<li>Techniques avancées d\'éloquence</li>'}
    </ul>
    <a href="https://arbre-a-palabre-9e83a.web.app/formations/${formation._id}" class="button">S'inscrire maintenant</a>
    <p style="font-size: 14px; color: #666; margin-top: 20px;">
      <em>Offre limitée ! Inscrivez-vous dès maintenant pour garantir votre place.</em>
    </p>
  `;

    return {
        subject: `📚 Formation : ${formation.titre} - ${formation.prix} FCFA`,
        html: baseTemplate('Formation Exclusive', content)
    };
};

// Template de félicitations pour victoire
const felicitationsVictoireTemplate = (data) => {
    const { candidat, debat } = data;

    const content = `
    <p>Félicitations <strong>${candidat.prenom} ${candidat.nom}</strong> ! 🎉🏆</p>
    <p>Vous avez remporté le débat "<strong>${debat.theme}</strong>" !</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">🥇 Victoire Éclatante !</h3>
      <p><strong>Score final :</strong> ${candidat.scoreFinal} points</p>
      <p><strong>Gains :</strong> ${debat.cagnotte ? (debat.cagnotte * 0.75).toLocaleString('fr-FR') + ' FCFA' : 'À venir'}</p>
    </div>
    <p>Votre talent et votre persévérance ont payé ! Continuez sur cette lancée. 💪</p>
    <p><strong>Prochaine étape :</strong> Perfectionnez vos compétences avec notre formation avancée et visez encore plus haut !</p>
    <a href="https://arbre-a-palabre-9e83a.web.app/formations" class="button">Découvrir nos formations</a>
  `;

    return {
        subject: '🏆 Félicitations pour votre victoire !',
        html: baseTemplate('Vous avez gagné !', content)
    };
};

// Template d'encouragement après défaite
const encouragementTemplate = (data) => {
    const { candidat, debat } = data;

    const content = `
    <p>Bonjour <strong>${candidat.prenom}</strong>,</p>
    <p>Merci d'avoir participé au débat "<strong>${debat.theme}</strong>". 💪</p>
    <p>Même si la victoire vous a échappé cette fois, votre performance était remarquable ! Chaque débat est une opportunité d'apprentissage.</p>
    <div class="highlight">
      <h3 style="margin-top: 0;">💡 Continuez à progresser !</h3>
      <p>Nos formations sont conçues pour vous aider à développer vos compétences et à briller lors du prochain débat.</p>
    </div>
    <p><strong>Statistiques :</strong></p>
    <ul>
      <li>Débats participés : ${candidat.nombreVictoires + candidat.nombreDefaites}</li>
      <li>Victoires : ${candidat.nombreVictoires}</li>
      <li>Taux de réussite : ${candidat.nombreVictoires + candidat.nombreDefaites > 0 ? ((candidat.nombreVictoires / (candidat.nombreVictoires + candidat.nombreDefaites)) * 100).toFixed(1) : 0}%</li>
    </ul>
    <a href="https://arbre-a-palabre-9e83a.web.app/formations" class="button">Voir les formations</a>
    <p>La prochaine victoire sera la vôtre ! 🌟</p>
  `;

    return {
        subject: '💪 Continuez à progresser !',
        html: baseTemplate('Merci pour votre participation', content)
    };
};

module.exports = {
    bienvenueVisiteurTemplate,
    nouveauDebatTemplate,
    resultatDebatTemplate,
    invitationParticipationTemplate,
    offreFormationTemplate,
    felicitationsVictoireTemplate,
    encouragementTemplate
};
