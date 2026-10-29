const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware pour parser les corps JSON et servir les fichiers statiques (interface Web)
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Route d'API : Vérifie si un numéro existe et s'il est banni sur WhatsApp
 * Exemple d'appel : GET /api/isBanned?number=33612345678
 */
app.get('/api/isBanned', async (req, res) => {
  // 1. Nettoyage du numéro : conserve uniquement les chiffres
  let num = (req.query.number || '').replace(/\D/g, '');

  if (!num || num.length < 7) {
    return res.status(400).json({
      error: "Veuillez fournir un numéro valide au format international avec le code pays (ex: ?number=33612345678)"
    });
  }

  try {
    // ÉTAPE 1 : Vérifier si le numéro existe sur WhatsApp
    let r1 = await fetch('https://v.whatsapp.net/v2/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp/2.26.41.6'
      },
      body: JSON.stringify({
        cc: num.slice(0, 3),
        in: num,
        lg: 'en',
        lc: 'US'
      })
    });

    if (r1.status !== 200) {
      return res.json({
        number: '+' + num,
        exists: false,
        banned: false,
        info: "Ce numéro n'est pas enregistré sur WhatsApp."
      });
    }

    // ÉTAPE 2 : Si le numéro existe, vérifier s'il est banni via la demande de code
    let r2 = await fetch('https://v.whatsapp.net/v2/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp/2.26.41.6'
      },
      body: JSON.stringify({
        cc: num.slice(0, 3),
        in: num,
        lg: 'en',
        lc: 'US',
        method: 'sms'
      })
    });

    let details = await r2.text();

    if (r2.status === 200) {
      return res.json({
        number: '+' + num,
        exists: true,
        banned: false,
        info: "Le numéro est actif et N'EST PAS banni."
      });
    } else {
      return res.json({
        number: '+' + num,
        exists: true,
        banned: true,
        info: "Le numéro existe mais semble être BANNI ou restreint.",
        details: details.slice(0, 300)
      });
    }

  } catch (error) {
    console.error("Erreur lors de la requête :", error);
    return res.status(500).json({
      error: "Erreur serveur lors de la vérification du numéro.",
      details: error.message
    });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`Serveur démarré avec succès !`);
  console.log(`Accès Web : http://localhost:${PORT}`);
  console.log(`Test API : http://localhost:${PORT}/api/isBanned?number=33612345678`);
  console.log(`=================================`);
});
