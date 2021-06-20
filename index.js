let account_id='${secrets.ACCOUNT_ID}';//请在第一次运行后，在这里输入你的account_id，就可以跳过获取验证码这一步了

(async()=>{
    const signin=require('./lib/signin');
    const login=require('./lib/login');
    if( account_id==undefined || account_id.trim()=='' ){
        let loginResult=await login();
        if( loginResult.status ){
            console.log('获取账户的account_id成功，请妥善保存好。')
            console.log('account_id:'+loginResult.userAccount);
            account_id=loginResult.userAccount;
        }else{
            console.log('获取失败，返回原因：'+loginResult.msg);
            return;
        }
    }
    let taskResult=await signin(account_id);
    console.log(`任务执行完毕~,总共花费${taskResult.useTime}`);
    if( taskResult.finish ){
        console.log(`程序正常执行完退出，领取流量${taskResult.value}次`);
    }else{
        console.log(`程序非正常执行完退出，领取流量${taskResult.value}次`);
        console.log(`非正常执行完退出，返回原因结果：${taskResult.msg}`);
    }
})();
