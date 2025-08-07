const https = require('https');
const fs = require('fs');
const path = require('path');

// Viktige flyselskaper for det norske markedet
const airlines = [
  'DY',  // Norwegian
  'SK',  // SAS
  'FR',  // Ryanair  
  'BA',  // British Airways
  'LH',  // Lufthansa
  'KL',  // KLM
  'AF',  // Air France
  'U2',  // easyJet
  'W6',  // Wizz Air
  'WF',  // Widerøe
  'AY',  // Finnair
  'LX',  // Swiss
  'OS',  // Austrian Airlines
  'SN',  // Brussels Airlines
  'TP',  // TAP Portugal
  'IB',  // Iberia
  'VY',  // Vueling
  'EW',  // Eurowings
  'TK',  // Turkish Airlines
  'QR',  // Qatar Airways
  'EK',  // Emirates
  'LO',  // LOT Polish Airlines
];

// Base URL for urbullet's airline logos
const baseUrl = 'https://raw.githubusercontent.com/urbullet/iata-airelines-logos/master/scripts/airlines-logos/';

// Opprett flylogo mappe hvis den ikke eksisterer
const logoDir = path.join(__dirname, 'public', 'flylogo');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
  console.log('📁 Opprettet flylogo mappe');
}

// Funksjon for å laste ned en logo
function downloadLogo(iataCode) {
  return new Promise((resolve, reject) => {
    const fileName = `${iataCode}.png`;
    const url = baseUrl + fileName;
    const filePath = path.join(logoDir, fileName);
    
    // Sjekk om filen allerede eksisterer
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${iataCode}.png - eksisterer allerede`);
      resolve();
      return;
    }
    
    const file = fs.createWriteStream(filePath);
    
    console.log(`⬇️  Laster ned ${iataCode}.png...`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.log(`❌ ${iataCode}.png - ikke funnet (${response.statusCode})`);
        file.close();
        fs.unlinkSync(filePath);
        resolve(); // Ikke reject, fortsett med andre
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${iataCode}.png - lastet ned`);
        resolve();
      });
      
      file.on('error', (err) => {
        file.close();
        fs.unlinkSync(filePath);
        console.log(`❌ ${iataCode}.png - feil: ${err.message}`);
        resolve(); // Ikke reject, fortsett med andre
      });
    }).on('error', (err) => {
      file.close();
      fs.unlinkSync(filePath);
      console.log(`❌ ${iataCode}.png - nettverksfeil: ${err.message}`);
      resolve(); // Ikke reject, fortsett med andre
    });
  });
}

// Last ned alle logoer
async function downloadAllLogos() {
  console.log('🛫 Starter nedlasting av flyselskap-logoer...');
  console.log(`📊 Totalt ${airlines.length} logoer å laste ned\n`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (const airline of airlines) {
    try {
      await downloadLogo(airline);
      if (fs.existsSync(path.join(logoDir, `${airline}.png`))) {
        successCount++;
      } else {
        failCount++;
      }
    } catch (error) {
      console.log(`❌ Feil ved nedlasting av ${airline}: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n🎯 RESULTAT:');
  console.log(`✅ Suksess: ${successCount} logoer`);
  console.log(`❌ Feilet: ${failCount} logoer`);
  console.log(`📁 Logoer lagret i: ${logoDir}`);
  
  // Vis hvilke logoer som ble lastet ned
  console.log('\n📋 TILGJENGELIGE LOGOER:');
  const logoFiles = fs.readdirSync(logoDir).filter(file => file.endsWith('.png'));
  logoFiles.sort().forEach(file => {
    const code = file.replace('.png', '');
    console.log(`   ${code}.png`);
  });
  
  if (logoFiles.length > 0) {
    console.log('\n🎉 Logoer er klare til bruk!');
    console.log('💡 Test systemet ved å gå til /reiser og søke etter flyreiser');
  }
}

// Start nedlastingen
downloadAllLogos().catch(console.error);
