import React, {Component} from 'react';
import {Form, Input, Radio, Button} from 'antd'
import {addBillFun} from '../../../../../server/newApi';
import cookie from 'react-cookies';

class CommonAdd extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
	}


	handleSubmit = (e) => {
		e.preventDefault();
		this.props.form.validateFieldsAndScroll((err, values) => {
			if (!err) {
				let params = {
					invoiceType: 0,
					userCode: this.userCode,
					...values
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
			labelCol: {span: 4},
			wrapperCol: {span: 16},
		};
		return (
			<Form {...formItemLayout} onSubmit={this.handleSubmit} className="mt2">
				<Form.Item label="抬头类型">
					{getFieldDecorator('titleType', {
						rules: [{required: true, message: '请选择抬头类型!'}],
					})(
						<Radio.Group onChange={this.onTitleTypeChange}>
							<Radio value='0'>个人</Radio>
							<Radio value='1'>企业</Radio>
						</Radio.Group>
					)}
				</Form.Item>
				<Form.Item label="发票抬头">
					{getFieldDecorator('titleDesc', {
						rules: [{required: true, message: '请输入发票抬头!'}],
					})(
						<Input />
					)}
				</Form.Item>
				{
					this.props.form.getFieldValue('titleType') === '1' ?
						<Form.Item label="纳税人识别号">
							{getFieldDecorator('creditCode', {
								rules: [{required: true, message: '请输入纳税人识别号!'}],
							})(
								<Input />
							)}
						</Form.Item>
						:
						null
				}
				<div className="bill-dialog-footer">
					<Button type="primary" htmlType="submit">保存</Button>
					<Button onClick={this.props.close}>取消</Button>
				</div>
			</Form>
		);
	}
}

const CommonAddForm = Form.create()(CommonAdd);
export default CommonAddForm
