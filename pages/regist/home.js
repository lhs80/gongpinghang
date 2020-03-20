import React, {Component} from 'react';
import Layout from 'components/Layout/login'
import RegPersonalForm from './components/RegPersonal'
import {Form, Tabs} from 'antd';
import './style.less'

class RegistrationForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			/*----企业----*/
			isShowQySend: false,
			qyCount: 60,
			qyCodeTip: '发送验证码',
			options: [],
			showCompany: 'block',
			companyTip: '',
			//是否被注册
			isReg: ''
		};
	}

	render() {
		return (
			<Layout className="register-wrapper" title="注册">
				<section className="regFormWrapper">
					<div className="registerForm">
						<div className="lineForm">
							<span className="cur" />
							<span />
							<span />
						</div>
						<h2 className="mt2 text-center large text-darkgrey">请注册</h2>
						<div className="userWrapper mt3">
							<RegPersonalForm history={this.props.history} />
						</div>
					</div>
				</section>
			</Layout>
		);
	}
}

const WrappedRegistrationForm = Form.create()(RegistrationForm);
export default WrappedRegistrationForm
