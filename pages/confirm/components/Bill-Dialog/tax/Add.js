import React, {Component} from 'react';
import {Form, Input, Radio, Button, Row, Col} from 'antd'
import {addBillFun} from '../../../../../server/newApi';
import {validatePhone, checkTel} from '../../../../../config/regular'
import cookie from 'react-cookies';

class TaxAdd extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
	}

	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let params = {
					invoiceType: 1,
					userCode: this.userCode,
					...values,
					titleType: 1,
				};
				addBillFun(params).then(res => {
					if (res.result === 'success') {
						this.props.form.resetFields();
						this.props.close();
					}
				})
			}
		})
	};

	render() {
		const {getFieldDecorator} = this.props.form;
		const formItemLayout = {
			labelCol: {span: 8},
			wrapperCol: {span: 16},
		};
		const formItemTail = {
			labelCol: {span: 4},
			wrapperCol: {span: 20},
		};
		return (
			<Form onSubmit={this.handleSubmit} className="mt2">
				<Row>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="抬头类型" style={{marginBottom: '10px'}}>
							{getFieldDecorator('titleType')(
								<Radio.Group>
									<Radio value='1' disabled checked>企业</Radio>
								</Radio.Group>
							)}
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="开户银行" style={{marginBottom: '10px'}}>
							{getFieldDecorator('depositBank', {
								rules: [{required: true, message: '请输入开户银行!'}],
							})(
								<Input />
							)}
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="发票抬头" style={{marginBottom: '10px'}}>
							{getFieldDecorator('titleDesc', {
								rules: [{required: true, message: '请输入发票抬头!'}],
							})(
								<Input />
							)}
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="银行账号" style={{marginBottom: '10px'}}>
							{getFieldDecorator('bankAccount', {
								rules: [{required: true, message: '请输入银行账号!'}],
							})(
								<Input />
							)}
						</Form.Item>
					</Col>
				</Row>
				<Row>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="纳税人识别号" style={{marginBottom: '10px'}}>
							{getFieldDecorator('creditCode', {
								rules: [{required: true, message: '请输入纳税人识别号!'}],
							})(
								<Input />
							)}
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item {...formItemLayout} label="电话号码" style={{marginBottom: '10px'}}>
							{getFieldDecorator('mobile', {
								validateFirst: true,
								rules: [
									{required: true, message: '请输入电话号码!'},
									{validator: validatePhone},
								],
							})(
								<Input />
							)}
						</Form.Item>
					</Col>
				</Row>
				<Form.Item {...formItemTail} label="注册地址" style={{marginBottom: '10px'}}>
					{getFieldDecorator('registeredAddress', {
						rules: [{required: true, message: '请输入注册地址!'}],
					})(
						<Input />
					)}
				</Form.Item>
				<div className="bill-dialog-footer">
					<Button type="primary" htmlType="submit">保存</Button>
					<Button onClick={this.props.close}>取消</Button>
				</div>
			</Form>
		);
	}
}

const TaxAddForm = Form.create()(TaxAdd);
export default TaxAddForm
