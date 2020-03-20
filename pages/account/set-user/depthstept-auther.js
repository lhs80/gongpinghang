// 深度认证第二步
import React from 'react'
import Layout from 'components/Layout/setting'
import {Icon, Row, Steps, Col, Radio} from 'antd'
import {iconUrl, baseUrl} from 'config/evn'
import {picUploadFun, autherInfoFun, dapthCertifyFun, userCodeFun} from 'server'
import LegalDelegateForm from './legal-delegate'
import LegalNDelegateForm from './legal-Nodelegate'
import './style.less'

const {Content} = Layout;
const Step = Steps.Step;
const RadioGroup = Radio.Group;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class DepthAutherTwoForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: 1,
			legalDelegate: 'block',
			legalNDelegate: 'none'
		};
	}

	/*-----选择法定代表与非法定代表-----*/
	onChange = (e) => {
		this.setState({
			value: e.target.value,
		});
		if (e.target.value === 1) {
			this.setState({
				legalDelegate: 'block',
				legalNDelegate: 'none'
			});
		}
		if (e.target.value === 2) {
			this.setState({
				legalDelegate: 'none',
				legalNDelegate: 'block'
			});
		}
	};
	componentWillUnmount = () => {
		this.setState = (state, callback) => {
			return false;
		};
	};

	render() {
		return (
			<Layout title="深度认证" mainMenuIndex={'setting'} menuIndex={'5'} >
				<section className="bg-white" style={{paddingTop: '40px'}}>
					<Row style={{paddingLeft: '70px'}}>
						<h1 className="h0">
							企业深度认证
						</h1>
					</Row>
					<Row style={{paddingRight: '70px'}}>
						<Col span={21} offset={2}>
							<Steps current={1} className="mt3 settingStep">
								<Step title="填写企业信息" status="process" />
								<Step title="完善管理人信息" />
								<Step title="提交信息待审核" />
								<Step title="等待收款，回填金额" />
								<Step title="完成认证" />
							</Steps>
						</Col>
					</Row>
					<Row className="legalSelect mt4">
						<Col span={8} className="text-right" style={{paddingRight: '6px'}}>选择账号管理人身份</Col>
						<Col span={16}>
							<RadioGroup onChange={this.onChange} value={this.state.value}>
								<Radio value={1}>法定代表</Radio>
								<Radio value={2}>非法定代表</Radio>
							</RadioGroup>
						</Col>
					</Row>
					{/*----法定代表---*/}
					<LegalDelegateForm legalDelegate={this.state.legalDelegate} history={this.props.history} />
					{/*----非法定代表---*/}
					<LegalNDelegateForm legalNDelegate={this.state.legalNDelegate} history={this.props.history} />
				</section>
			</Layout>
		)
	}
}

export default DepthAutherTwoForm
