// 用户中心
import React from 'react'
import Layout from 'components/Layout/account'
import {Button, Icon} from 'antd';
import {iconUrl} from 'config/evn'
import AddInquiry from '../../../components/AddInquiry';


const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class PaySuccess extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Layout title="支付成功" mainMenuIndex={'home'} menuIndex={'6'}>
				<aside className="pay-result">
					<IconFont type="iconfont-wancheng" style={{fontSize: '80px', color: '#18bcc9'}} />
					<h3 className="mt3 text-grey">恭喜你，支付成功！</h3>
					<div className="text-grey h3" style={{marginTop: '45px'}}>是否立即开始询价？</div>
					<AddInquiry text={'立即询价'}
					            type="primary"
					            size="large"
					            showModalOfType={this.showModalOfType}
					            class={'mt3 h3'}
					            style={{width: '300px'}}
					/>
					<h3 className="mt2"><a href="/" className="text-primary">返回首页</a></h3>
				</aside>
			</Layout>
		)
	}
}
