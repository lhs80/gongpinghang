
/** 动态更改文字聊天窗口的高度 */
/*eslint-disable*/

let scrollTimer = null;

let page = {
    // 滚动聊天列表到底部
    scrollChatListDown: (pos, initCount) => {
        let dom = document.getElementById('accountMid');
        if (!dom) {
            return
        }
        let maxCount = 5;
        initCount = initCount || 1;
        if (typeof pos !== 'number') {
            pos = Math.max(dom.scrollHeight - dom.clientHeight, 888888)
        }
        dom.scrollTop = pos;
        if ((dom.scrollTop < pos) && (initCount < maxCount)) {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => {
                initCount++;
                page.scrollChatListDown(pos, initCount)
            }, 200)
        }
    },
    getChatListHeight: () => {
        return document.getElementById('accountMid').scrollHeight
    },
    getChatListScroll: () => {
        return document.getElementById('accountMid').scrollTop
    },
};

export default page
