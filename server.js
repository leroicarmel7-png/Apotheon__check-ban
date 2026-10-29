const express = require('express');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const { 
  default: makeWASocket, 
  useMultiFileAuthState, 
  DisconnectReason, 
  fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===================== 👑 VAELMOR FAMILY • JUGEMENT SUPRÊME =====================
const VAELMOR = {
  ENGINE: "7UCG-2.1.0",
  FAMILY: "𓆩🌹 𝗩𝗔𝗘𝗟𝗠𝗢𝗥 𝗙𝗔𝗠𝗜𝗟𝗬 🕯️𓆪",
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

// ===================== 🤖 INITIALISATION DU BOT WHATSAPP (BAILEYS) =====================
let sock = null;
let isConnected = false;

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }), // Masque les logs superflus
    printQRInTerminal: true
  });

  sock.implementsCredsUpdate = saveCreds;

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    
    if (qr) {
      console.log('⚡ Scannez ce QR code avec votre compte WhatsApp pour initialiser le moteur Vaelmor :');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      isConnected = false;
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      console.log('⚠️ Connexion WhatsApp fermée. Reconnexion en cours...', shouldReconnect);
      if (shouldReconnect) {
        startWhatsAppBot();
      }
    } else if (connection === 'open') {
      isConnected = true;
      console.log('✅ Bot WhatsApp connecté avec succès à la session Vaelmor !');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// Lancer le bot au démarrage du serveur
startWhatsAppBot();

// ===================== API ROUTE • VERDICT VAELMOR VIA BOT =====================
app.get('/api/isBanned', async (req, res) => {
  let num = (req.query.number || '').replace(/\D/g, '');

  if (!num || num.length < 7) {
    return res.status(400).json({
      error: "Numéro invalide",
      vaelmor: VAELMOR.FAMILY,
      engine: VAELMOR.ENGINE
    });
  }

  if (!isConnected || !sock) {
    return res.status(503).json({
      error: "Le bot WhatsApp n'est pas encore connecté. Veuillez scanner le QR code dans le terminal du serveur.",
      vaelmor: VAELMOR.FAMILY
    });
  }

  try {
    // Utilisation de la session Baileys connectée pour vérifier si le numéro est sur WhatsApp
    // Baileys fournit une méthode native onWhatsApp pour vérifier l'existence des numéros proprement
    const [result] = await sock.onWhatsApp(num + '@s.whatsapp.net');

    if (!result || !result.exists) {
      return res.json({
        number: '+' + num,
        exists: false,
        banned: true,
        vaelmor_verdict: VAELMOR.VERDICTS.PERMA,
        engine: VAELMOR.ENGINE,
        family: VAELMOR.FAMILY,
        info: "Ce numéro n'est pas enregistré sur WhatsApp (sanction totale / introuvable)."
      });
    }

    // Si le numéro existe sur WhatsApp via le bot, on considère qu'il est propre (CLEAN)
    // Ou tu peux adapter ta logique de test de code ici selon tes besoins précis
    return res.json({
      number: '+' + num,
      exists: true,
      banned: false,
      vaelmor_verdict: VAELMOR.VERDICTS.CLEAN,
      engine: VAELMOR.ENGINE,
      family: VAELMOR.FAMILY,
      info: "Le numéro est actif et enregistré sur le réseau."
    });

  } catch (error) {
    console.error("Erreur lors de la vérification via le bot :", error);
    return res.status(500).json({
      error: "Erreur lors du traitement par le moteur Vaelmor.",
      details: error.message
    });
  }
});

// Lancement du serveur Web
app.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`${VAELMOR.FAMILY} - Interface active sur le port ${PORT}`);
  console.log(`Accès Web : http://localhost:${PORT}`);
  console.log(`=================================`);
});
      
