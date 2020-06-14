const Util = require('./util.js');
const sgMail = require('@sendgrid/mail');
const fs = require('fs');

class FetchMachine {
    constructor (urls, frequency, sessionId, sendgridApiKey) {
        this.urls = urls;
        this.frequency = frequency;
        this.sessionId = sessionId;
        sgMail.setApiKey(sendgridApiKey);
        this.stopFlag = {};
        for (let i = 0; i < urls.length; i++) {
            this.stopFlag[urls[i]] = false;
        }
    }

    run (vars) {
        for (let i = 0; i < this.urls.length; i++) {
            let url = this.urls[i];
            if(vars){
                for(let key in vars)  {
                    url = url.replace(`{${key}}`, vars[key]);
                }
            }
            this.fetchLoop(url);
        }
    }

    fetchLoop (url) {
        if (this.stopFlag[url]) {
            console.log(`網址中的場地被搶走囉 ${url}`);
            return;
        }
        const instance = this;
        Util.fetchAsync(url, {
            headers: {
                'Cookie': `ASP.NET_SessionId=${this.sessionId}`,
            }
        }, (resp) => {
            instance.respHandler.call(instance, resp, url);
        });

        setTimeout(() => {
            this.fetchLoop(url);
        }, this.frequency);
    }

    async respHandler (resp, originalUrl) {
        const body = await resp.text();
        if (body.indexOf('員身分證字號') !== -1) {
            console.log('請輸入正確的 Session Id');
        } else {
            const redirectUrl = Util.extractRedirectUrlFromHTML(body);
            const orderNumber = Number(Util.getQueryString(redirectUrl, 'Y'));
            if (orderNumber !== 0) {
                console.log('搶到場地囉!');
                const msg = {
                    to: 'miterfrants@gmail.com',
                    from: 'auto@io.com',
                    subject: '大安羽球 Booking Mahine',
                    text: '搶到場地囉!'
                };
                sgMail.send(msg);
                this.stopFlag[originalUrl] = true;
            } else if (Util.getQueryString(redirectUrl, 'X') === '2') {
                console.log('被搶走囉！');
		fs.appendFileSync('../dist/log.txt', '被搶走囉!');
                this.stopFlag[originalUrl] = true;
            } else {
                console.log('unknow error');
            }
        }
    }
}
module.exports = FetchMachine;
