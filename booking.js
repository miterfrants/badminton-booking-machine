const fs = require('fs');
const cron = require('node-cron');
const moment = require('moment');
const Web = require('./tools/web.js');
const FetchMachine = require('./tools/fetch-machine.js');


if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
}
if (!fs.existsSync('./dist/log.txt')) {
    fs.writeFileSync('./dist/log.txt', '');
}

cron.schedule('55 59 15 * * *', async () => {
    try {
        const urlRawData = fs.readFileSync('./config/urls.json');
        const secretsRawData = fs.readFileSync('./config/secrets.json');
        
        const urls = JSON.parse(urlRawData);
        const secrets = JSON.parse(secretsRawData);
        const now = moment().add(14,'days');
        const shortDateString = now.toISOString().split('T')[0].split('-').join('/');
        
        if(!urls[now.day().toString()]){
            return;
        }

        const sessionId =  await Web.login(secrets.id,secrets.pwd);
        fs.appendFileSync('./dist/log.txt', sessionId);
        console.log(`sessionId: ${sessionId}`);
        const fetchMachine = new FetchMachine(urls[now.day().toString()], 500, sessionId, secrets.sendgridApiKey);
        
        fetchMachine.run({
            date: shortDateString,
            dayIndex: now.day()
        });
    } catch (error) {
	    console.log(error);
        fs.appendFileSync('./dist/log.txt', JSON.stringify(error));
    }
});
