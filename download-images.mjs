import fs from 'fs';
import path from 'path';
import https from 'https';

const destDir = path.join('src', 'assets', 'images');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const downloads = [
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/logo_resultado.webp', name: 'logo.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/logo-white_resultado.webp', name: 'logo-white.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/hero.webp', name: 'hero.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/sobre.webp', name: 'sobre.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/sobre_02_resultado.webp', name: 'cerimonia.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/sobre_02_resultado.webp', name: 'sobre_02.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/sobre_03_resultado.webp', name: 'sobre_03.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/salao-3.webp', name: 'salao-3.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/salao-2.webp', name: 'salao-2.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/salao-1.webp', name: 'salao-1.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/infra-2.webp', name: 'infra-2.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/infra-1.webp', name: 'infra-1.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-12.webp', name: 'galeria-12.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-11.webp', name: 'galeria-11.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-10.webp', name: 'galeria-10.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-9.webp', name: 'galeria-9.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-8.webp', name: 'galeria-8.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-7.webp', name: 'galeria-7.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-6.webp', name: 'galeria-6.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-5.webp', name: 'galeria-5.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-4.webp', name: 'galeria-4.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-3.webp', name: 'galeria-3.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-2.webp', name: 'galeria-2.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/galeria-1.webp', name: 'galeria-1.webp' },
  { url: 'https://media.dmove.com.br/clients/mares-ilha-bela/photos/contato-bg.webp', name: 'contato-bg.webp' }
];

function download(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return download(res.headers.location, filePath).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const stream = fs.createWriteStream(filePath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve();
      });
      stream.on('error', reject);
    }).on('error', reject);
  });
}

async function run() {
  console.log(`Iniciando download de ${downloads.length} imagens...`);
  for (const item of downloads) {
    const dest = path.join(destDir, item.name);
    try {
      await download(item.url, dest);
      console.log(`✅ ${item.name}`);
    } catch (err) {
      console.error(`❌ Erro em ${item.name}:`, err.message);
    }
  }
  console.log('Concluído!');
}

run();
