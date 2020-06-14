const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment');
const Web = require('./tools/web.js');
const FetchMachine = require('./tools/fetch-machine.js');
const urlRawData = fs.readFileSync('./config/urls.json');
const secretsRawData = fs.readFileSync('./config/secrets.json');

const urls = JSON.parse(urlRawData);
const secrets = JSON.parse(secretsRawData);

if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}
if (!fs.existsSync('./dist/log.txt')) {
    fs.writeFileSync('./dist/log.txt', '');
}

cron.schedule('55 59 15 * * *', async () => {
    try {
        const sessionId =  await Web.login(secrets.id,secrets.pwd);
        fs.appendFileSync('./dist/log.txt', sessionId);
        console.log(`sessionId: ${sessionId}`);
        const fetchMachine = new FetchMachine(urls, 500, sessionId, secrets.sendgridApiKey);
        const shortDateString = moment().add(14,'days').toISOString().split('T')[0].split('-').join('/');
        fetchMachine.run({
            date: shortDateString
        });        
    } catch (error) {
	    console.log(error);
        fs.appendFileSync('./dist/log.txt', JSON.stringify(error));
    }
});
