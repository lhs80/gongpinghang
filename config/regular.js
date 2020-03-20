//校验手机号码
export function checkPhone(val) {
	const reg = /^1[23456789][0-9]{9}$/;
	return reg.test(val)
}

//校验座机号码
export function checkTel(val) {
	const reg = /^0\d{2,3}-\d{7,8}$/;
	return reg.test(val)
}

//校验400号码
export function checkFreeTel(val) {
	const reg = /^400-[0-9]{3}-[0-9]{4}$/;
	return reg.test(val)
}

export const validatePhone = (rule, phonenum, callback) => {
	const reg = /^1[23456789][0-9]{9}$/;
	if (phonenum && !reg.test(phonenum)) {
		callback('请输入正确的手机号码');
	} else {
		callback();
	}
};
export const validateBlank = (rule, value, callback) => {
	if (value && value.indexOf(' ') !== -1) {
		callback('格式不正确')
	} else {
		callback();
	}
};

/*-----校验对公银行账号------*/
export function checkBank(val) {
	const reg = /^\d{16,19}$/;
	return reg.test(val)
}

/*-------校验身份证-------*/
export const checkIDNum = (rule, DNum, callback) => {
	//身份证正则表达式(15位)
	const reg15 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
	//身份证正则表达式(18位)
	// const reg18=/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{4}$/;
	const reg18 = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/;
	if (DNum && DNum.length === 18) {
		if (!reg18.test(DNum)) {
			callback('请输入正确的身份证格式')
		} else {
			callback()
		}
	} else if (!DNum) {
		callback()
	} else {
		callback('请输入正确的身份证格式')
	}
};

export const validateCredit = (rule, creditNum, callback) => {
	const reg = /^[A-Za-z0-9]{18}$/;
	if (creditNum && !reg.test(creditNum)) {
		callback('请输入18位信用代码');
	} else {
		callback();
	}
};

//匹配图片（g表示匹配所有结果i表示区分大小写）
export const imgReg = /<img.*?(?:>|\/>)/gi;
//匹配src属性
export const srcReg = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;

// 全部重复递增递减
export const checkRepeat = (pwd) => {
	let repeat = true;
	let series = true;
	let drop = true;
	let len = pwd.length;
	let first = pwd.charAt(0);
	for (let i = 1; i < len; i++) {
		//重复
		repeat = repeat && (pwd.toLowerCase().charAt(i) === first);
		//递增keyCode
		series = series && (pwd.toLowerCase().charCodeAt(i) === pwd.toLowerCase().charCodeAt(i - 1) + 1);
		//递减keyCode
		drop = drop && (pwd.toLowerCase().charCodeAt(i) === pwd.toLowerCase().charCodeAt(i - 1) - 1);
	}
	return (repeat || series || drop)
};

//校验小数，
// 不能以0开头
//小数点后保留一位或两位小数
export const unzeronumber = /^(?:0|[1-9]\d*)(\.\d{1,2})?$/;
