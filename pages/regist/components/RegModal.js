/*----注册成功的弹窗-----*/
import React, {Component} from 'react';
import Router, {withRouter} from 'next/router'
import {Form, Icon, Button} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const FormItem = Form.Item;

export class RegModal extends React.Component {
	constructor(props) {
		super(props);
	}

	nextStep = () => {
		cookie.remove('registInfo');
		Router.push({pathname: '/'})
	};

	render() {
		return (
			<div style={{display: this.props.isShow}}>
				<div className="regModal">
					<Form className="modalForm">
						<div className="modalTop">
							<IconFont type="iconfont-chenggong1" style={{fontSize: '85px'}} />
							<span className="large" style={{marginLeft: '20px'}}>注册完成!</span>
						</div>
						<p className="text-center userContent text-darkgrey h4">是否完善您的用户资料</p>
						<FormItem>
							<div className="modenBtn text-center">
								<Button size="large" type="primary" block
								        onClick={() => {
									        Router.push('/regist/supplementary')
								        }}
								        className="bg-primary-linear border-circle"
								        style={{height: '50px'}}
								>去完善</Button>
								<a href="javascript:;" className="lastStep" onClick={this.nextStep.bind(this)}>跳过</a>
							</div>
						</FormItem>
					</Form>
				</div>
			</div>
		)
	}
}

export default withRouter(RegModal)
