const FormData = require('form-data');
const Util = require('./util.js');
const fs = require('fs');
const Web = {
    login: async (id, password) => {
        const res = await Util.fetchAsync('https://scr.cyc.org.tw/tp03.aspx?module=login_page&files=login');
        const setCookies = res.headers.raw()['set-cookie'][0];
        const session = setCookies.split('; ').find((item)=>{
            return item.indexOf('ASP.NET_SessionId') === 0;
        });
        const sessionId = session.split('=')[1];
        const resp = await Util.fetchAsync('https://scr.cyc.org.tw/NewCaptcha.aspx',{
            headers: {
                'Cookie': `ASP.NET_SessionId=${sessionId}`
            }
        });
        const buff = await resp.buffer();
        fs.writeFileSync('./dist/captcha.gif', buff);
        const captcha = await Util.recognizeCaptcha('./dist/captcha.gif');

        const form = new FormData();
        form.append('loginid', id);
        form.append('loginpw', password);
        form.append('Captcha_text', captcha);
        
        const respLogin = await Util.fetchAsync('https://scr.cyc.org.tw/tp03.aspx?Module=login_page&files=login',{
            method: 'POST',
            headers: {
                ...form.getHeaders(),
                'Cookie': `ASP.NET_SessionId=${sessionId}`,
            },
            body: form
        });
        var loginStatus = (await respLogin.text()).split(',');
        if (loginStatus[0] == 2) {
            Util.log(loginStatus[1]);
            throw Error(loginStatus[1]);
        }
        if (loginStatus[0] == 1) {
            Util.log('帳號或密碼錯誤');
            throw Error('帳號或密碼錯誤');
        }
        return sessionId;
    }
};
module.exports = Web;