/*-----收货地址-----*/
import React from 'react'
import {Icon, Row, Badge, Button, Modal} from 'antd'
import {userAddressFun} from 'server'
import cookie from 'react-cookies';
import {iconUrl, baseUrl} from 'config/evn'
import Address from 'components/address'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});


class MaterialAddAdress extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			defaultAddress: '默认地址',
			//收货地址的所有地址
			customerData: [],
			//被选中的收货地址
			selectData: [],
			selectCustomerData: [],
			currentIndex: null,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			addressDisabled: true,
			addressShow: false,
			selectAddress: true
		}
	}

	componentDidMount() {
		this.userAddress();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.isShowAddress === 'block') {
			this.userAddress()
		}
	}

	/*-----关闭收货地址弹窗----*/
	closeAddress = () => {
		let status = 'none';
		this.props.showAddressModal(status);
	};
	/*---关闭添加新地址---*/
	closeNewAddress = () => {
		this.setState({
			selectAddress: true
		});
		let status = 'none';
		this.props.showAddressModal(status);
	};
	/*----选择收货地址----*/
	selectAddress = (item, index) => {
		const {selectData} = this.state;
		if (selectData.length > 0) {
			selectData.splice(0, selectData.length);
		}
		selectData.push(item);
		this.setState({
			selectData,
			currentIndex: index,
			addressDisabled: false
		});
	};
	/*----点击确认时把选中的地址传给父组件---*/
	onSureFun = (e) => {
		e.preventDefault();
		let status = 'none';
		let info = this.state.selectData;
		this.props.selectAddresInfo(info, status);
	};
	userAddress = () => {
		/*---用户收货地址---*/
		let params = {
			userCode: this.state.userCode
		};
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let userData = res.data;
				this.setState({
					customerData: userData
				})
			}
		})
	};
	/*返回上一层*/
	changeBlackLast = () => {
		this.setState({
			selectAddress: true
		});
		this.userAddress();
	};

	render() {
		const {customerData, addressDisabled} = this.state;

		return (
			<section style={{display: this.props.isShowAddress}} className="addBusiness">
				{
					this.state.selectAddress ?
						<div className="addressMwrapper commonWrapper ptb3 ">
							<h2 className="text-left prl3">选择收货地址</h2>
							<IconFont type="iconfont-guanbi" className="closeBtn" onClick={this.closeAddress.bind(this)} />
							<div className="addressInfo">
								{
									customerData.map((item, index) => {
										return (
											<Row className={`lineAddress ${index === this.state.currentIndex ? 'activeAddress' : ''}`} key={index}
											     onClick={() => this.selectAddress(item, index)}>
												<div className="customerInfo">
                          <span className="headerImg show text-center" style={{width: '80px'}}>
                              <IconFont type="iconfont-gerentouxiangyihuifu" className="iconMe h1 text-muted" />
                          </span>
													<div className="show info text-darkgrey ptb1" style={{width: '380px'}}>
														<div>
															<span style={{marginRight: '20px'}}>{item.userName}</span>
															<span>{item.userPhone}</span>
														</div>
														<p style={{margin: '0'}}>{item.province + item.city + item.area + item.address}</p>
													</div>
												</div>
												{
													item.isDefault === '1'
														? <span className="defaultAddress show text-center">默认地址</span>
														: null
												}
											</Row>
										)
									})
								}
							</div>
							<div className="text-center">
								<Button type="primary" style={{marginRight: '16px'}} className="h5" onClick={() => this.setState({selectAddress: false})}
								        size="large" ghost>
									增加新地址
								</Button>
								<Button type="primary" style={{width: '120px'}} onClick={this.onSureFun.bind(this)} disabled={addressDisabled} size="large"
								        className="h5">确认</Button>
							</div>
						</div>
						:
						<Modal
							title="添加地址"
							visible={true}
							footer={null}
							width={560}
							onCancel={this.closeNewAddress}
						>
							<Address history={this.props.history} changeBlackLast={this.changeBlackLast} />
						</Modal>
					// <div className="inquiryAddressWrapper commonWrapper ptb3">
					//   <h2 className="text-left prl3">添加新地址</h2>
					//   <IconFont type="iconfont-guanbi" className="closeBtn" onClick={this.closeNewAddress}/>
					//   <Address history={this.props.history} changeBlackLast={this.changeBlackLast}/>
					// </div>
				}
			</section>
		)
	}
}

export default MaterialAddAdress;
