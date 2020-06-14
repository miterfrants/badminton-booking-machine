const fetch = require('node-fetch');
const gm = require('gm');
const tesseract = require("node-tesseract-ocr");

const Util = {
    fetchAsync: (url, options, cb) => {
        const promise = new Promise((resolve, reject) => { //eslint-disable-line
            fetch(url, {
                ...options,
                rejectUnauthorized: false
            }).then(async (res) => {
                resolve(res);
                if(cb){
                    cb(res);
                }
            });
        });
        return promise;
    },
    recognizeCaptcha: (imagePath) => {
        return new Promise((resolve, reject) => {
            const config = {
                lang: "eng",
                oem: 1,
                tessedit_char_whitelist: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
                psm: 3,
            };

            gm(imagePath)
                .blur(1, 2)
                .level(1, 0.1, 60, true)
                .type('grayscale')
                .write('./dist/captcha.png', (a, b) => {
                    tesseract.recognize('./dist/captcha.png', config)
                        .then(text => {
                            resolve(text.replace(/\W/gi,''));
                        })
                        .catch(error => {
                            reject(error);
                        });
                });
        });
    },
    getQueryString: (url, key) => {
        const search = url.split('?')[1];
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
    },
    extractRedirectUrlFromHTML: (html) => {
        const scriptStartTag = '<script>';
        const scriptEndTag = '</script>';
        firstScriptStartPos = html.indexOf(scriptStartTag);
        firstScriptEndPos = html.indexOf(scriptEndTag, firstScriptStartPos);
        const redirectUrl = html.substring(firstScriptStartPos + scriptStartTag.length, firstScriptEndPos).toString().trim();
        return redirectUrl.replace('window.location.href=', '').replace(/'/g, '').replace(/"/g, '');
    }
};
module.exports = Util;