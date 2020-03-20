/*eslint-disable*/


export function onRoamingMsgs (obj) {
  /*store.commit('updateMsgs', obj.msgs)*/
}

export function onOfflineMsgs (obj) {
  /*store.commit('updateMsgs', obj.msgs)*/
}

export function onMsg (msg) {
    //存的名字时id(userCode)唯一性
   /* let id = msg.id || '';
    let old = JSON.parse(sessionStorage.getItem(id)) || [];
    let msgs = msg.lastMsg;
    if(msgs.status === 'success')old.push(msgs);
    sessionStorage.setItem(id, JSON.stringify(old));*/
}

function onCustomMsg(msg) {
    // 处理自定义消息
}
function onSendMsgDone (error, msg) {
  if (error) {
    // 被拉黑
    if (error.code === 7101) {
      msg.status = 'success'
      alert(error.message)
    } else {
      alert(error.message)
    }
  }
  onMsg(msg)
}
