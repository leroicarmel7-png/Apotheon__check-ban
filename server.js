const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================== 👑 VAELMOR FAMILY • JUGEMENT SUPRÊME =====================
const VAELMOR = {
  ENGINE: "7UCG-2.1.0",
  FAMILY: "𓆩🌹 𝗩𝗔𝗘𝗟𝗠𝗢𝗥 𝗙𝗔𝗠𝗜𝗟𝗬 🕯️𓆪",
  SEAL: "OFFICIAL SEAL • VAELMOR FAMILY • JUDGMENT",
  VERDICTS: {
    CLEAN: {
      code: "Ⅲ",
      title: "𓊈Ⅲ𓊉 ━━ 𝐂𝐈𝐁𝐋𝐄 𝐓𝐎𝐔𝐉𝐎𝐔𝐑𝐒 𝐃𝐄𝐁𝐎𝐔𝐓",
      quote: "Tu es encore debout, mais le verdict reste inchangé. Survivre à un affrontement ne signifie pas l'avoir remporté. Vaelmor a parlé ; le résultat suffit.",
      off: "⏳ par 𓆩🌹 𝗩𝗔𝗘𝗟𝗠𝗢𝗥 𝗙𝗔𝗠𝗜𝗟𝗬 🕯️𓆪",
      badge: "CLEAN • DEBOUT"
    },
    TEMP: {
      code: "Ⅰ",
      title: "𓊈Ⅰ𓊉 ━━ 𝐒𝐀𝐍𝐂𝐓𝐈𝐎𝐍 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐈𝐑𝐄",
      quote: "« Défaite prononcée. Ta sanction est temporaire, mais ta défaite restera un fait. Vaelmor a rendu son verdict ; il ne te reste qu'à l'assumer. »",
      off: "📵Off by 𓆩🌹 𝗩𝗔𝗘𝗟𝗠𝗢𝗥 𝗙𝗔𝗠𝗜𝗟𝗬 🕯️𓆪",
      badge: "TEMP • SANCTION"
    },
    PERMA: {
      code: "Ⅱ",
      title: "𓊈Ⅱ𓊉 ━━ 𝐒𝐀𝐍𝐂𝐓𝐈𝐎𝐍 𝐓𝐎𝐓𝐀𝐋𝐄",
      quote: "\"Verdict définitif. Ton parcours face à Vaelmor s'achève ici. La sentence est prononcée, la décision est scellée. Rien ne changera l'issue de ce jugement.\"",
      off: "🍷Off by 𓆩🌹 𝗩𝗔𝗘𝗟𝗠𝗢𝗥 𝗙𝗔𝗠𝗜𝗟𝗬 🕯️𓆪",
      badge: "PERMA • TOTALE"
    }
  }
};

// ===================== API BOT • REAL BAN ENGINE 7UCG =====================
/**
 * Route d'API : Vérifie si un numéro existe et s'il est banni
 * GET /api/isBanned?number=33612345678
 * Retourne avec verdict VAELMOR
 */
app.get('/api/isBanned', async (req, res) => {
  let num = (req.query.number || '').replace(/\D/g, '');

  if (!num || num.length < 7) {
    return res.status(400).json({
      error: "Numéro invalide",
      vaelmor: VAELMOR.FAMILY,
      engine: VAELMOR.ENGINE,
      exemple: "?number=22891847613"
    });
  }

  try {
    // ÉTAPE 1 : Existe ?
    let r1 = await fetch('https://v.whatsapp.net/v2/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp/2.26.41.6 Android/13 Device/Pixel-7'
      },
      body: JSON.stringify({ cc: num.slice(0, 3), in: num, lg: 'en', lc: 'US' })
    });

    if (r1.status !== 200) {
      return res.json({
        number: '+' + num,
        exists: false,
        banned: false,
        vaelmor_verdict: VAELMOR.VERDICTS.PERMA,
        engine: VAELMOR.ENGINE,
        family: VAELMOR.FAMILY,
        info: "Ce numéro n'est pas enregistré sur WhatsApp."
      });
    }

    // ÉTAPE 2 : Banni ?
    let r2 = await fetch('https://v.whatsapp.net/v2/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WhatsApp/2.26.41.6 Android/13 Device/Pixel-7'
      },
      body: JSON.stringify({ cc: num.slice(0, 3), in: num, lg: 'en', lc: 'US', method: 'sms' })
    });
    
    let t2 = await r2.text();

    if (r2.status === 200) {
      return res.json({
        number: '+' + num,
        exists: true,
        banned: false,
        vaelmor_verdict: VAELMOR.VERDICTS.CLEAN,
        engine: VAELMOR.ENGINE,
        family: VAELMOR.FAMILY,
        info: "Le numéro est actif et propre."
      });
    } else {
      return res.json({
        number: '+' + num,
        exists: true,
        banned: true,
        vaelmor_verdict: VAELMOR.VERDICTS.TEMP, // ou PERMA selon ton choix
        engine: VAELMOR.ENGINE,
        family: VAELMOR.FAMILY,
        details: t2.slice(0, 300)
      });
    }

  } catch (error) {
    console.error("Erreur serveur :", error);
    return res.status(500).json({
      error: "Erreur serveur",
      vaelmor: VAELMOR.FAMILY,
      details: error.message
    });
  }
});

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`${VAELMOR.FAMILY} - Engine ${VAELMOR.ENGINE}`);
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`=================================`);
});
        
