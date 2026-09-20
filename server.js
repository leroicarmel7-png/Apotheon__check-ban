const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CHECK BAN GLOBAL - Tous pays
app.get('/api/check/:number', async (req, res) => {
    let raw = req.params.number;
    let num = raw.replace(/\D/g,''); // garde que les chiffres

    // Sécurité: il faut au minimum un indicatif pays
    if(num.length < 10 || num.length > 15) {
        return res.json({
            number: raw,
            status: 'INVALID',
            message: '❌ Numéro invalide. Mets l\'indicatif pays : ex 33612345678, 12125551234, 22890123456'
        });
    }
    
    // Simulation pour l'instant (on branchera le vrai moteur Baileys après)
    const lastDigit = parseInt(num[num.length-1]);
    const isBanned = lastDigit % 3 === 0; // juste pour demo
    
    res.json({
        number: '+' + num,
        status: isBanned ? 'BANNED' : 'OK',
        country: 'Détection auto',
        message: isBanned ? '❌ Numéro banni WhatsApp' : '✅ Numéro disponible / clean',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, ()=> console.log(`APOTHEON GLOBAL ONLINE :${PORT}`));
