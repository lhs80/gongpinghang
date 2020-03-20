var url = 'https://cstaticdun.126.net/load.min.js' + '?t=' + getTimestamp(1 * 60 * 1000) // 时长1分钟，建议时长分钟级别
loadScript(url, function () {
	// 进行初始化验证码等后续逻辑
	// initNECaptcha({
	//   captchaId: '从易盾申请的captchaId',
	//   element: '#captcha'
	// })
})

function getTimestamp(msec) {
	msec = !msec && msec !== 0 ? msec : 1
	return parseInt((new Date()).valueOf() / msec, 10)
}

function loadScript(src, cb) {
	var head = document.head || document.getElementsByTagName('head')[0]
	var script = document.createElement('script')

	cb = cb || function () {
	}

	script.type = 'text/javascript'
	script.src = src

	if (!('onload' in script)) {
		script.onreadystatechange = function () {
			if (this.readyState !== 'complete' && this.readyState !== 'loaded') return
			this.onreadystatechange = null
			cb(script)
		}
	}

	script.onload = function () {
		this.onload = null
		cb(script)
	}

	head.appendChild(script)
}
