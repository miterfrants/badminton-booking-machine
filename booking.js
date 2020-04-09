const fetchUrl = require('fetch').fetchUrl;
const fs = require('fs');
const rawdata = fs.readFileSync('urls.json');
const urls = JSON.parse(rawdata);

class FetchMachine {
    constructor (urls, frequency, sessionId) {
        this.urls = urls;
        this.frequency = frequency;
        this.sessionId = sessionId;
        this.stopFlag = {};
        for (let i = 0; i < urls.length; i++) {
            this.stopFlag[urls[i]] = false;
        }
    }

    run () {
        for (let i = 0; i < this.urls.length; i++) {
            const url = this.urls[i];
            this.fetchLoop(url);
        }
    }

    fetchLoop (url) {
        console.log('fetchLoop');
        if (this.stopFlag[url]) {
            console.log(`網址中的場地被搶走囉 ${url}`);
            return;
        }
        const instance = this;
        fetchUrl(url, {
            cookies: [`ASP.NET_SessionId=${process.env.sessionId}`]
        }, (error, meta, body) => {
            instance.respHandler.call(instance, error, meta, body);
        });

        setTimeout(() => {
            this.fetchLoop(url);
        }, this.frequency);
    }

    respHandler (error, meta, body) {
        if (body.toString().indexOf('員身分證字號') !== -1) {
            console.log('請輸入正確的 Session Id');
        } else {
            // extract redirect url
            const redirectUrl = extractRedirectUrlFromHTML(body.toString());
            const orderNumber = Number(getQueryString(redirectUrl, 'Y'));
            if (orderNumber !== 0) {
                console.log('搶到場地囉!');
                this.stopFlag[meta.finalUrl] = true;
            } else if (getQueryString(redirectUrl, 'X') === '2') {
                console.log('被搶走囉！');
                this.stopFlag[meta.finalUrl] = true;
            }
        }
    }
}


if(!process.env.sessionId){
    console.log('請輸入你的 Session Id env key: sessionId');
    return;
}

if(!process.env.frequency){
    console.log('請輸入你的幾秒搶一次 env key: frequency');
    return;
}

const fetchMachine= new FetchMachine(urls, process.env.frequency, process.env.sessionId);
fetchMachine.run();


function extractRedirectUrlFromHTML(html) {
    const scriptStartTag = '<script>';
    const scriptEndTag = '</script>';
    firstScriptStartPos =html.indexOf(scriptStartTag);
    firstScriptEndPos = html.indexOf(scriptEndTag, firstScriptStartPos);
    const redirectUrl =html.substring(firstScriptStartPos + scriptStartTag.length, firstScriptEndPos).toString().trim();
    return redirectUrl.replace('window.location.href=', '').replace(/'/g,'').replace(/"/g,'')
}

function getQueryString(url, key) {
    const search= url.split('?')[1]
    if (!search) {
        return '';
    }
    const queryStrings = search.split('&');
    const result = queryStrings.find((qs) => {
        if (qs.indexOf(`${key}=`) === 0) {
            return true;
        } else {
            return false;
        }
    });
    if (result) {
        return decodeURIComponent(result.split('=')[1]);
    }
    return '';
}