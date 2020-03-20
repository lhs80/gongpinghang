
 import {onSessions, onUpdateSession} from '../utils/session'
 import {onRoamingMsgs, onOfflineMsgs, onMsg} from '../utils/msgs'
 import cookie from 'react-cookies';
 //import {onSysMsgs, onSysMsg} from './sysMsgs'
const SDK = require('./NIM_Web_SDK_v5.6.0');

export function initNimSdk(state, loginInfo) {
  if (state.nim) {
    state.nim.disconnect();
  }
  window.nim = state.nim = SDK.NIM.getInstance({
      //appKey: "ff5d75c67c3a22522077ec29b924c5c9",
      //公司
      appKey: "2bae53e4c277b3b65df7c2aa71675cb7",
    account: loginInfo.uid,
    token: loginInfo.sdktoken,
    debug:false,
    //连接成功
    onconnect: function (event) {
      if (loginInfo) {
        //state.commit('updateUserUID', loginInfo);
        console.log('SDK 连接成功');
        cookie.save("imInfoSuccess","success")
      }
    },
    getLocalSessions:function(session){

    },
    //连接失败
    onerror: function (event) {
      console.log('SDK 连接断开')
    },
    ondisconnect: function (error) {//连接断开
        /*switch (error.code) {
            // 账号或者密码错误, 请跳转到登录页面并提示错误
            case 302:
                pageUtil.turnPage('账号或密码错误', 'login')
                break;
            // 被踢, 请提示错误后跳转到登录页面
            case 'kicked':
                let map = {
                    PC: '电脑版',
                    Web: '网页版',
                    Android: '手机版',
                    iOS: '手机版',
                    WindowsPhone: '手机版'
                }
                let str = error.from
                let errorMsg = `你的账号于${util.formatDate(new Date())}被${(map[str] || '其他端')}踢出下线，请确定账号信息安全!`
                pageUtil.turnPage(errorMsg, 'login')
                break
            default:
                break
        }*/
      console.log("连接断开");
    },
      // // 会话
      onsessions: onSessions,
      onupdatesession: onUpdateSession,
      // // 消息
      onroamingmsgs: onRoamingMsgs,
      onofflinemsgs: onOfflineMsgs,
      onmsg: onMsg,
      // // 系统通知
      /*onsysmsg: onSysMsg,
      onofflinesysmsgs: onSysMsgs,*/
  })
}

