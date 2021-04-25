module.exports=(account_id)=>{
    return new Promise(async(resolve,reject)=>{
        let isBreak=false;
        let ret={
            value:0,
            finish:false
        };
        let currentTime=new Date().getTime();
        console.log('开始执行打开领取任务');
        while( !isBreak ){
            //执行4次，避免显示时间不够异常的退出
            for( let i=0;i<=3;i++ ){
                let addTimeRes=await addTime(account_id);
                // 手动延迟125s
                await (()=>new Promise((a,b)=>setTimeout(()=>a(),1000*60*2+5000)))();
                console.log(addTimeRes);
            }
            let getGiftRes=await getGift(account_id);
            if( typeof getGiftRes=='object' ){
                ret.value++;
                console.log('剩余执行次数：'+readGiftResult.daySurplus);
                if( readGiftResult.daySurplus==0 ){
                    // console.log('执行完退出');
                    isBreak=true;
                    ret.finish=true;
                }
            }else{
                ret.msg=getGiftRes;
                // console.log('非执行完退出');
                isBreak=true;
            }
        }
        ret.useTime=( new Date().getTime()-currentTime ) / 1000 +'s';
        resolve(ret);
    });
}

const request = require('request');

function addTime(account_id){
    return new Promise((resolve,reject)=>{
        request({
            url:'http://st.woread.com.cn/touchextenernal/contentread/ajaxUpdatePersonReadtime.action',
            method:'POST',
            headers:{
                'Cookie':`useraccount=${account_id};`,
                'Content-Type':'application/json; charset=UTF-8'
            },
            body: `cntindex=480230&cntname=%E4%B9%A1%E6%9D%91%E5%B0%8F%E5%86%9C%E5%8C%BB&time=2`
        },(err,res,html)=>{
            let result=JSON.parse(html);
            resolve(result.ActiJson);
        });
    });
}

function getGift(account_id){
    return new Promise((resolve,reject)=>{
        const request = require('request');
        request({
            url:'http://st.woread.com.cn/touchextenernal/readActivity/sendRightOfGoldCoin.action?userType=112_3001&homeArea=036&homeCity=468',
            method:'GET',
            headers:{
                'Cookie':`useraccount=${account_id};`,
                'Content-Type':'application/json; charset=UTF-8'
            }
        },(err,res,html)=>{
            let result=JSON.parse(html);
            resolve(result.message);
        });
    });
}
