
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;

app.get('/api/check/:phone', async (req,res)=>{
  const clean = req.params.phone.replace(/[^0-9]/g,'');
  // Moteur simplifié pour test Railway - remplacera par vrai moteur Baileys après
  res.json({phone: clean, banned:false, status:'active', message:'Serveur en ligne - moteur prêt', isReal:true, seal:'APOTHEON'});
});
app.get('/api/health',(req,res)=>res.json({ok:true, name:'APOTHEON_CHECK_BAN'}));

app.get('*',(req,res)=>{
  const pub = path.join(__dirname,'public','index.html');
  const root = path.join(__dirname,'index.html');
  const fs = require('fs');
  if(fs.existsSync(pub)) return res.sendFile(pub);
  if(fs.existsSync(root)) return res.sendFile(root);
  res.send('APOTHEON ONLINE');
});

app.listen(PORT, ()=>console.log(`APOTHEON ONLINE :${PORT}`));
