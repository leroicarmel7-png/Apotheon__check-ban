
const express = require('express');
const path = require('path');
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

async function checkBanReal(input) {
  const digits = String(input || '').replace(/\D/g, '');
  const phone = parsePhoneNumberFromString('+' + digits);

  if (!phone || !phone.isValid()) {
    return {
      status: 'INVALID_NUMBER',
      message: 'Numéro invalide. Vérifie son indicatif international.'
    };
  }

  // WhatsApp ne propose pas d'API publique officielle permettant
  // de vérifier le bannissement de n'importe quel numéro.
  // Ne pas transformer une erreur réseau en verdict.
  try {
    const response = await fetch('https://v.whatsapp.net/v2/exists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'VAELMOR-VERDICT/1.0'
      },
      body: JSON.stringify({
        cc: phone.countryCallingCode,
        in: phone.number.slice(1),
        lg: 'en',
        lc: 'US'
      }),
      signal: AbortSignal.timeout(10000)
    });

    // Une réponse HTTP 200 ne prouve pas qu'un compte est débanni.
    // Le format de cette API non documentée n'est pas fiable
    // pour déterminer un bannissement.
    return {
      status: 'INDETERMINATE',
      phone: phone.number,
      message: `Réponse reçue (HTTP ${response.status}), mais aucun statut de bannissement fiable ne peut être confirmé.`
    };
  } catch (error) {
    return {
      status: 'INDETERMINATE',
      phone: phone.number,
      message: 'Service inaccessible ou délai dépassé. Aucun verdict n’a été inventé.'
    };
  }
}

app.get('/api/check/:number', async (req, res) => {
  try {
    const result = await checkBanReal(req.params.number);

    res.status(result.status === 'INVALID_NUMBER' ? 400 : 200).json({
      ...result,
      engine: 'VAELMOR-VERDICT',
      verifiedBanStatus: false
    });
  } catch (error) {
    res.status(500).json({
      status: 'INDETERMINATE',
      message: 'Erreur interne. Aucun verdict fiable disponible.',
      engine: 'VAELMOR-VERDICT',
      verifiedBanStatus: false
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VAELMOR VERDICT lancé sur le port ${PORT}`);
});
