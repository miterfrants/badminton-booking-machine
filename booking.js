const fs = require('fs');
const cron = require('node-cron');
const Web = require('./tools/web.js');
const FetchMachine = require('./tools/fetch-machine.js');
const urlRawData = fs.readFileSync('./config/urls.json');
const secretsRawData = fs.readFileSync('./config/secrets.json');

const urls = JSON.parse(urlRawData);
const secrets = JSON.parse(secretsRawData);

fs.writeFileSync('./dist/log.txt');

cron.schedule('50 59 23 * * 1-3', async () => {
    try {
        const sessionId =  await Web.login(secrets.id,secrets.pwd);
        fs.appendFileSync('./dist/log.txt', sessionId);
        console.log(`sessionId: ${sessionId}`);
        const fetchMachine = new FetchMachine(urls, 500, sessionId, secrets.sendgridApiKey);
        fetchMachine.run();        
    } catch (error) {
        fs.appendFileSync('./dist/log.txt', JSON.stringify(error));
    }
});
