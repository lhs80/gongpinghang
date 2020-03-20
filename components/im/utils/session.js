/*
 * 会话列表
 */

import cookie from 'react-cookies';
import { timeToString ,timestampToTime,userCodeFun} from 'server/'
let userCode = cookie.load("ZjsWeb") ? cookie.load("ZjsWeb").userCode : 'guest';
// onSessions获取对方的消息
export function onSessions (sessions) {
    let id = sessions.id || '';
    let msg = JSON.parse(sessionStorage.getItem(id)) || [];
    for(let i  in sessions){
        msg.push(sessions[i].lastMsg);
    }
   sessionStorage.setItem(id, JSON.stringify(msg));
   //console.log('收到会话列表', sessions);
}

/*-------发收的每条信息-------*/
export function onUpdateSession (session) {
    //存的名字时id(userCode)唯一性
    let id = session.id || '';
    //console.log("会话更新");
    let old = JSON.parse(sessionStorage.getItem(id)) || [];
    let oldAllMessage = JSON.parse(sessionStorage.getItem(userCode)) || [];
    let msg = session.lastMsg;
    if(msg.status === 'success'){
        old.push(msg);
        oldAllMessage.push(msg);
    }
    sessionStorage.setItem(id, JSON.stringify(old));
    sessionStorage.setItem(userCode, JSON.stringify(oldAllMessage));

}

export function updateSessionsUI() {
    // 刷新界面
}
