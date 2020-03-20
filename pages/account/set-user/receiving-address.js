//收货地址
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/setting'
import {Icon, Button, Row, Col, Badge, Popconfirm} from 'antd';
import cookie from 'react-cookies';
import {iconUrl, baseUrl} from 'config/evn'
import {userAddressFun, setDefaultFun, deleteAddressFun} from 'server'

import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class ReceivindAddress extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null;
		this.state = {
			customerData: [],//收货地址的所有地址
		}
	}

	componentDidMount() {
		this.getUserAddress()
	}

	/*----跳转新增收货地址-----*/
	addAddress = (e) => {
		e.preventDefault();
		Router.push('/account/set-user/add-address')
	};
	/*-----编辑收货地址-----*/
	editAddress = (item) => {
		Router.push('/account/set-user/edit-address');
		// this.props.history.push(`/editAddress`);
		cookie.save('editAddress', item)
	};
	/*-----删除收货地址-----*/
	deletAddress = (item, index) => {
		const {customerData} = this.state;
		deleteAddressFun(item.id).then(res => {
			if (res.result === 'success') {
				customerData.splice(index, 1);
				this.setState({
					customerData
				})
			}
		})
	};
	/*----设置默认地址-----*/
	setDefault = (item) => {
		setDefaultFun(this.userCode, item.id).then(res => {
			if (res.result === 'success') {
				this.getUserAddress();
			}
		})
	};

	getUserAddress = () => {
		let params = {
			userCode: this.userCode,
			type: 0
		}
		/*---用户收货地址---*/
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let userData = res.data;
				for (let i in userData) {
					if (!userData[i].street) {
						userData[i].street = ''
					}
				}
				this.setState({
					customerData: userData
				})
			}
		})
	}

	render() {
		const {customerData} = this.state;
		return (
			<Layout title="收货地址" menuIndex={'7'} mainMenuIndex={'setting'}>
				<section className="bg-white p3 receivindAddress">
					<section>
						<Button type="primary" className="bg-primary-linear border-radius" onClick={this.addAddress.bind(this)}>新增收货地址</Button>
						<Row className="bg-lightgrey  topBar mt2 text-muted">
							<Col span={21}>地址信息</Col>
							<Col span={3}>操作</Col>
						</Row>
						{
							customerData.map((item, index) => {
								return (
									<Row className="addressInfo ptb2" key={index}>
										<Col span={21} className="text-grey">
											<h4>
												<span>{item.userName}</span>
												<span className="prl3">{item.userPhone}</span>
												{
													item.isDefault === '1'
														? <Badge count="默认地址" style={{
															backgroundColor: '#ebf7dd',
															color: '#66bb6a',
															height: '24px',
															lineHeight: '24px',
															padding: '0 12px'
														}} />
														: null
												}
											</h4>
											<p className="h5 mt1" style={{width: '580px'}}>{item.province + item.city + item.area + item.address}</p>
											{
												item.isDefault !== '1' ?
													<span className="h5 text-primary defaultAddress" onClick={() => {
														this.setDefault(item, index)
													}}>设为默认</span>
													: null
											}
										</Col>
										<Col span={3}>
											<IconFont type="iconfont-chakan" className="h0 text-grey" style={{cursor: 'pointer'}} onClick={() => {
												this.editAddress(item, index)
											}} />
											<span className="operationIcon prl2 text-secondary">|</span>
											{/*<Popconfirm title="确定删除吗？" okText="确定" cancelText="取消"  onConfirm={() => {
                              this.deletAddress(item, index)
                            }}>
                              <IconFont type="iconfont-htmal5icon17" className="h0 text-grey" style={{cursor: "pointer"}}/>
                            </Popconfirm>*/}
											<a><IconFont type="iconfont-htmal5icon17" className="h0 text-grey" style={{cursor: 'pointer'}}
											             onClick={() => this.deletAddress(item, index)} /></a>
										</Col>
									</Row>
								)
							})
						}
					</section>
				</section>
			</Layout>
		)
	}
}
