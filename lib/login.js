const {RSAUtils}=require('./security');
const modulus='00D9C7EE8B8C599CD75FC2629DBFC18625B677E6BA66E81102CF2D644A5C3550775163095A3AA7ED9091F0152A0B764EF8C301B63097495C7E4EA7CF2795029F61229828221B510AAE9A594CA002BA4F44CA7D1196697AEB833FD95F2FA6A5B9C2C0C44220E1761B4AB1A1520612754E94C55DC097D02C2157A8E8F159232ABC87';
const exponent='010001';
const RSAKey=RSAUtils.getKeyPair(exponent, '', modulus);
module.exports=()=>{
    return new Promise(async(resolve,reject)=>{
        let phoneNumber=await readInput('请输入你的手机号码：');
        phoneNumber=phoneNumber.trim();
        if( /^1[0-9]{10}$/.test(phoneNumber) ){
            let { cookie,verifyCode }=await init();
            let sendVerifyCodeRes=await sendPhoneVerifyCode(cookie,verifyCode,phoneNumber);
            if( sendVerifyCodeRes.status ){
                console.log('验证码发送成功');
                let phoneVerifyCode=await readInput('请输入验证码：');
                let loginRes=await toLogin(cookie,phoneNumber,phoneVerifyCode);
                if( loginRes.status ){
                    resolve({
                        status:true,
                        userAccount:loginRes.userAccount
                    });
                }else{
                    resolve({
                        status:false,
                        msg:loginRes.msg
                    });
                }
            }else{
                // console.log(sendVerifyCodeRes.msg);
                resolve({
                    status:false,
                    msg:sendVerifyCodeRes.msg
                });
            }
        }else{
            resolve({
                status:false,
                msg:'手机号码输入格式有误'
            });
        }
    });
}
const request=require('request');

function toLogin(cookie,phoneNumber,code){
    return new Promise((resolve,reject)=>{
        request({
            url:'https://m.iread.wo.cn/userinfo/login/ajaxOneKeyLogin2.action',
            method:'POST',
            headers:{
                'Cookie':cookie,
                'Content-Type':'application/x-www-form-urlencoded'
            },
            form:{
                phoneNum:RSAUtils.encryptedString(RSAKey,phoneNumber),
                code:code,
                existuser:true
            }
        },(err,response,body)=>{
            let result=JSON.parse(body);
            if( result.code=='0000' ){
                for( let item of response.headers['set-cookie'] ){
                    let tmp=item.split(';')[0];
                    if( tmp.split('=')[0]=='useraccount' ){
                        userAccount=tmp.split('=')[1];
                    }
                }
                resolve({
                    status:true,
                    userAccount
                });
            }else{
                resolve({
                    status:false,
                    msg:result.message
                });
            }
        });
    });
}

function sendPhoneVerifyCode(cookie,verifyCode,phoneNumber){
    return new Promise((resolve,reject)=>{
        request({
            url:'https://m.iread.wo.cn/push/getVerifyCode3.action',
            method:'POST',
            headers:{
                'Cookie':cookie,
                'Content-Type':'application/x-www-form-urlencoded'
            },
            form:{
                telephone:RSAUtils.encryptedString(RSAKey,phoneNumber),
                graphicCode:verifyCode
            }
        },(err,response,body)=>{
            let result=JSON.parse(body);
            if( result.code=='0000' )resolve({status:true});
            else resolve({
                status:false,
                msg:result.message
            });
        });
    });
}

function init(){
    return new Promise((resolve,reject)=>{
        request({
            url:'https://m.iread.wo.cn/userinfo/login/geneVC2.action',
            method:'POST',
            headers:{
                'Referer': 'https://m.iread.wo.cn/userinfo/login/telephoneLoginPage.action'
            }
        },(err,response,body)=>{
            let setCookie=response.headers['set-cookie'];
            let cookieArr=[];
            for( let item of setCookie ){
                cookieArr.push(item.split(';')[0]);
            }
            let cookies=cookieArr.join(';');
            resolve({
                cookie:cookies,
                verifyCode:JSON.parse(body).vc
            });
        });
    });
}

function readInput(tip){
    const readline = require('readline');
    return new Promise(async(resolve,reject)=>{
        let r=readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        r.question(tip,function(input){
            resolve(input);
            r.close();
        });
    });
}