const fs = require("fs");
const axios = require("axios");
const args = process.argv.slice(2);


if (args.length < 2) {
    console.error('Необходимо указать название сайта и режим (1 или 2)');
    process.exit(1);
}

const websiteName = args[0];
const mode = parseInt(args[1]);


if (isNaN(mode) || (mode !== 1 && mode !== 2)) {
    console.error('Режим должен быть 1 или 2');
    process.exit(1);
}

require('dotenv').config({path: `./${websiteName}/.env`});

function readUrlsFromFile(filePath) {
    return fs.readFileSync(filePath, 'utf8').split('\n').map(url => url.trim()).filter(Boolean);
}

// Функция для разбиения массива на части
function chunkArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}


// Функция для отправки URL в IndexNow
async function submitUrlsToIndexNow(domain, urlChunks, endpoint) {
    for (const urls of urlChunks) {
        const modifiedUrls = urls.map(path => `https://${domain}${path}`);
        const payload = {
            host: domain,
            key: process.env.INDEX_NOW_API_KEY,
            urlList: modifiedUrls,
        };

        try {
            console.log(payload);
            const response = await axios.post(endpoint, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(`Response from IndexNow: ${response.status}`, response.data);
        } catch (error) {
            console.error(`Error submitting URLs to IndexNow: ${error}`);
        }
    }
}


(async function () {
    const allUrls = readUrlsFromFile(`./${websiteName}/urls.txt`);
    const urlChunks = chunkArray(allUrls, 10000); // Для IndexNow

    // Отправка URL в IndexNow (Yandex)

    if (mode === 1) {
        await submitUrlsToIndexNow(`${process.env.OLD_DOMAIN}`, urlChunks, `https://yandex.com/indexnow`);
    } else if (mode === 2) {
        await submitUrlsToIndexNow(`${process.env.OLD_DOMAIN}`, urlChunks, `https://yandex.com/indexnow`);
        await submitUrlsToIndexNow(`${process.env.NEW_DOMAIN}`, urlChunks, `https://yandex.com/indexnow`);
    }
})();