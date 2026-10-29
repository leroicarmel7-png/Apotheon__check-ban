
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));

app.get('/api/check/:number', (req, res) => {
  const digits = String(req.params.number || '').replace(/\D/g, '');

  if (digits.length < 8 || digits.length > 15) {
    return res.status(400).json({
      status: 'INVALID_NUMBER',
      message: 'Le numéro doit contenir entre 8 et 15 chiffres.',
      phone: digits ? '+' + digits : null
    });
  }

  // Aucune API publique fiable ne confirme ici le statut de bannissement.
  return res.json({
    status: 'INDETERMINATE',
    phone: '+' + digits,
    message: 'Statut non confirmé. Vérifie le compte dans l’application WhatsApp.',
    engine: 'VAELMOR VERDICT'
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`VAELMOR VERDICT lancé sur le port ${PORT}`);
});
