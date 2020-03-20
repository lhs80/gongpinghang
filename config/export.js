// 将一个sheet转成最终的excel文件的blob对象，然后利用URL.createObjectURL下载
export function sheet2blob(wbout, sheetName) {
  // sheetName = sheetName || 'sheet1';
  // let workbook = {
  //   SheetNames: [sheetName],
  //   Sheets: {}
  // };
  // workbook.Sheets[sheetName] = sheet; // 生成excel的配置项
  //
  // let wopts = {
  //   bookType: 'xlsx', // 要生成的文件类型
  //   bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
  //   type: 'binary'
  // };
  // let wbout = XLSX.write(workbook, wopts);
  let blob = new Blob([s2ab(wbout)], {
    type: "application/octet-stream"
  });

  // 字符串转ArrayBuffer
  function s2ab(s) {
    let buf = new ArrayBuffer(s.length);
    let view = new Uint8Array(buf);
    for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }

  return blob;
}

export function openDownloadDialog(url, saveName) {
  if (typeof url === 'object' && url instanceof Blob) {
    url = URL.createObjectURL(url); // 创建blob地址
  }
  let aLink = document.createElement('a');
  aLink.href = url;
  aLink.download = saveName || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
  let event;
  // if (window.MouseEvent) event = new MouseEvent('click');
  if (typeof MouseEvent !== 'function') {
    (function () {
      let _MouseEvent = window.MouseEvent;
      window.MouseEvent = function (type, dict) {
        dict = dict | {};
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(
          type,
          (typeof dict.bubbles === 'undefined') ? true : !!dict.bubbles,
          (typeof dict.cancelable === 'undefined') ? false : !!dict.cancelable,
          dict.view || window,
          dict.detail | 0,
          dict.screenX | 0,
          dict.screenY | 0,
          dict.clientX | 0,
          dict.clientY | 0,
          !!dict.ctrlKey,
          !!dict.altKey,
          !!dict.shiftKey,
          !!dict.metaKey,
          dict.button | 0,
          dict.relatedTarget || null
        );
      }
    })();
  }
  else {
    event = document.createEvent('MouseEvents');
    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  debugger;
  if (window.MouseEvent) {
    let evt = document.createEventObject();
    aLink.fireEvent('onclick', evt);
  }
  else
    aLink.dispatchEvent(event);
}

export function saveAs(obj, fileName) {
  let csvData = new Blob([obj], {type: 'text/csv'});
  // for IE
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(csvData, fileName);
  }
  // for Non-IE (chrome, firefox etc.)
  else {
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    let url = URL.createObjectURL(csvData);
    a.href = url;
    a.download = fileName || '下载';
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
};

export const s2ab = s => {
  let buf = new ArrayBuffer(s.length);
  let view = new Uint8Array(buf);
  for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
  return buf;
};