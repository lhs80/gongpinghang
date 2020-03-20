import React, {Component} from 'react';
import {Button, Form, Input} from 'antd';

const FormItem = Form.Item;

class SendSms extends Component {
	constructor(props) {
		super(props);
		this.state = {
			codeTip: '发送验证码',
			count: 59,
			isShowSend: false
		}
	}

	handleSendSmsCode = () => {
		this.props.sendSmsCode();
		let self = this;
		setTimeout(() => {
			console.log(self.props.isSendSuccess);
			if (self.props.isSendSuccess) {
				self.setState({
					isShowSend: true
				});
				self.setTime();
			}
		}, 1000)
	};

	setTime() {
		let self = this;
		debugger;
		if (!this.state.isShowSend) return;
		let count = this.state.count;
		const timer = setInterval(function () {
			self.setState({
				count: (--count),
			});
			if (count === 0) {
				clearInterval(timer);
				self.setState({
					isShowSend: false,
					count: 59,
					codeTip: '重新发送'
				})
			}
		}, 1000);
	}

	render() {
		const {getFieldDecorator, getFieldError} = this.props.form;
		const BtnGroup = this.state.isShowSend
			? <Button type="link" className="h4">{this.state.count}s</Button>
			: <Button type="link" className="h4"
			          disabled={getFieldError('phone') || !this.props.form.getFieldValue('phone')}
			          onClick={this.handleSendSmsCode}>{this.state.codeTip}</Button>;
		return (
			<FormItem label="短信验证码">
				{getFieldDecorator('smsCode', {
					rules: [
						{required: true, message: '请输入短信验证码'},
					]
				})(
					<Input placeholder="请输入短信验证码" size="large" style={{width: '300px'}} suffix={BtnGroup} />
				)}
			</FormItem>
		);
	}
}

export default SendSms;
