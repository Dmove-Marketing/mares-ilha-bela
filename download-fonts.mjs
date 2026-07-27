import fs from 'fs';
import path from 'path';
import https from 'https';

const fontsDir = path.join('public', 'assets', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

// URLs for Host Grotesk fonts on Google Fonts GitHub repo
const fontSources = [
  {
    url: 'https://github.com/google/fonts/raw/main/ofl/hostgrotesk/HostGrotesk%5Bwght%5D.ttf',
    targets: ['HostGrotesk-Light.ttf', 'HostGrotesk-Regular.ttf', 'HostGrotesk-Medium.ttf']
  },
  {
    url: 'https://github.com/google/fonts/raw/main/ofl/hostgrotesk/HostGrotesk-Italic%5Bwght%5D.ttf',
    targets: ['HostGrotesk-LightItalic.ttf', 'HostGrotesk-Italic.ttf', 'HostGrotesk-MediumItalic.ttf']
  }
];

function download(url, destPath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, destPath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const stream = fs.createWriteStream(destPath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function main() {
  console.log('Baixando fontes locais Host Grotesk...');
  for (const src of fontSources) {
    const tempFile = path.join(fontsDir, 'temp.ttf');
    try {
      await download(src.url, tempFile);
      for (const targetName of src.targets) {
        const dest = path.join(fontsDir, targetName);
        fs.copyFileSync(tempFile, dest);
        console.log(`✅ Salvo: ${dest}`);
      }
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    } catch (err) {
      console.error(`❌ Erro baixando ${src.url}:`, err.message);
    }
  }
  console.log('Concluído!');
}

main();
