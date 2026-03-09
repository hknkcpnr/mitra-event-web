const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

const dataFile = path.join(__dirname, 'data', 'content.json');
const uploadsDir = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

let contentStr = fs.readFileSync(dataFile, 'utf8');
let content = JSON.parse(contentStr);

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                reject(new Error(`Failed to download: ${res.statusCode}`));
                return;
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => reject(err));
        });
    });
};

async function processObject(obj) {
    if (typeof obj === 'string') {
        if (obj.startsWith('http') && (obj.includes('unsplash.com') || obj.match(/\.(jpeg|jpg|png|gif|webp)/i))) {
            const hash = crypto.createHash('md5').update(obj).digest('hex').substring(0, 10);
            const extMatch = obj.match(/\.(jpeg|jpg|png|gif|webp)/i);
            const ext = extMatch ? extMatch[1] : 'jpg';
            const filename = `img_${hash}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            const localUrl = `/uploads/${filename}`;

            console.log(`Downloading ${localUrl}...`);
            if (!fs.existsSync(filepath)) {
                await downloadImage(obj, filepath);
            }
            return localUrl;
        }
        return obj;
    }

    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            obj[i] = await processObject(obj[i]);
        }
        return obj;
    }

    if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            obj[key] = await processObject(obj[key]);
        }
        return obj;
    }

    return obj;
}

async function start() {
    try {
        console.log('Starting image download process...');
        content = await processObject(content);
        fs.writeFileSync(dataFile, JSON.stringify(content, null, 2));
        console.log('Finished updating content.json');
    } catch (e) {
        console.error('Error:', e);
    }
}

start();
