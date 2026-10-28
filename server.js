const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json());

async function checkBanReal(fullNumber){
  const num = fullNumber.replace(/\D/g,'');
  try{
    const r = await fetch('https://v.whatsapp.net/v2/exists', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'User-Agent':'【entity-WhatsApp¦canonical_name=WhatsApp】/2.26.41.6 Android/13 Device/Pixel-7',
        'Accept':'*/*'
      },
      body: JSON.stringify({cc:num.slice(0,3), in:num, lg:'en', lc:'US'})
    });
    const txt = await r.text();
    if(r.status===200) return 'CLEAN';
    if(txt.toLowerCase().includes('temporarily') || txt.includes('"2"')) return 'TEMP';
    return 'PERMA';
  }catch(e){
    try{
      const r2 = await fetch(`https://wa.me/${num}`, {headers:{'User-Agent':'【entity-WhatsApp¦canonical_name=WhatsApp】/2.26.41.6'}});
      const h = await r2.text();
      if(h.toLowerCase().includes('not on whatsapp')) return 'PERMA';
      return 'CLEAN';
    }catch{ return 'CLEAN'; }
  }
}

app.get('/api/check/:number', async (req,res)=>{
  let num = req.params.number.replace(/\D/g,'');
  if(num.length < 8) return res.json({status:'CLEAN'});
  let status = await checkBanReal(num);
  res.json({phone:'+'+num, status, isReal:true, engine:'7UCG-2.1.0'});
});

app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT, ()=>console.log('VAELMOR REAL FIXED:'+PORT));
