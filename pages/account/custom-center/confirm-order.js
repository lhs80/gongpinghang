// 用户中心
import React from 'react'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Table, Divider, Input, Modal, message, Icon} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {quoteDetailFun, timestampToTime, addOrderFun, queryInquiryDetailFun, userAddressFun} from 'server'
import MaterialAddAdress from 'components/MaterialAddAdress'
import '../set-user/style.less'
import cookie from 'react-cookies';

const {TextArea} = Input;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MyInquiryQuoteDetail extends React.Component {
	constructor(props) {
		super(props);
		// this.shopId = this.props.match.params.shopId;
		// this.sheetId = this.props.match.params.sheetId;
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			inquiryInfo: {},
			quoteInfo: {},
			orderNote: '',
			showConfirmModal: false,
			showAddress: 'none',//收货地址
			addressData: [],
			showBtn: false,
			addressTip: false
		};

		this.materialColumns = [{
			title: '序号',
			render(text, record, index) {
				return index + 1
			},
			dataIndex: 'materialInquiryId',
			align: 'center'
		}, {
			title: '材料名称',
			dataIndex: 'materialName',
			align: 'center'
		}, {
			title: '品牌',
			dataIndex: 'materialBrand',
			align: 'center'
		}, {
			title: '单位',
			dataIndex: 'materialUnit',
			align: 'center'
		}, {
			title: '数量',
			dataIndex: 'quantity',
			align: 'center'
		}, {
			title: '税点',
			dataIndex: 'taxRate',
			align: 'center',
			render(text, record, index) {
				return text === '0.00' ? '——' : `${text}%`
			},
		}, {
			title: '税金',
			dataIndex: 'taxes',
			align: 'center',
			render(text, record, index) {
				return text === 0 ? '——' : `￥${text}`
			},
		}, {
			title: '单价',
			dataIndex: 'unitPrice',
			align: 'center',
			render(text, record, index) {
				return `￥${text}`
			},
		}, {
			title: '材料总价',
			dataIndex: 'totalPrice',
			align: 'center',
			render(text, record, index) {
				//return `￥${text}`
				return `￥${Number(record.totalPrice) + Number(record.taxes)}`
			},
		}];
	}

	componentDidMount() {
		this.queryInquiryDetail();
		this.queryQuoteDetail();
		this.getDefaultAddress();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.shopId !== this.props.router.query.shopId || prevProps.router.query.sheetId !== this.props.router.query.sheetId) {
			this.queryInquiryDetail();
			this.queryQuoteDetail();
			this.getDefaultAddress();
		}
	}

	/**
	 * 询价单详情
	 * */
	queryInquiryDetail() {
		let params = {
			inquirySheetId: this.props.router.query.sheetId
		};
		queryInquiryDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryInfo: res.data,
				});
			}
		})
	}

	/**
	 * 报价详情
	 * */
	queryQuoteDetail() {
		let shopId = this.props.router.query.shopId;
		let sheetId = this.props.router.query.sheetId;
		let params = {
			shopId: shopId,
			inquirySheetId: sheetId
		};
		quoteDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					quoteInfo: res.data[0],
				});
			}
		})
	}

	orderNoteChange = (e) => {
		this.setState({
			orderNote: e.target.value
		})
	};

	addOrder = () => {
		const {addressData} = this.state;
		let params = {
			shopId: this.props.router.query.shopId,//this.shopId,
			inquirySheetId: this.props.router.query.sheetId,
			orderNote: this.state.orderNote,
			consigneeName: addressData[0].userName,
			consigneePhone: addressData[0].userPhone,
			consigneeAddress: addressData[0].province + addressData[0].city + addressData[0].area + addressData[0].address,
			consigneeArea: addressData[0].area,
			consigneeCity: addressData[0].city,
			consigneeProvince: addressData[0].province
		};
		addOrderFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					showConfirmModal: false
				}, () => {
					message.open({
						content: <div className="ptb2">
							<h4 className="text-grey"><IconFont type="iconfont-wancheng" className="text-primary large" /> 提交成功</h4>
							{/*<h4 className="mt2 text-grey">商家确认采购单后您将获得15积分</h4>*/}
						</div>,
						onClose: () => {
							Router.push({pathname: '/account/purchase/home', query: {type: 1, status: 0}})
						}
					});
				})
			}
		})
	};
	getDefaultAddress = () => {
		let params = {
			userCode: this.state.userCode
		};
		userAddressFun(params).then(res => {
			if (res.result === 'success') {
				let userData = res.data;
				let address = [];
				for (let i in userData) {
					if (userData[i].isDefault === '1') {
						address.push(userData[i]);
						this.setState({
							showBtn: true,
							addressData: address,
						})
					}
				}
			}
		})
	};
	/*-----选择收货地址---*/
	addressFun = (e) => {
		e.preventDefault();
		this.setState({
			showAddress: 'block',
		});
	};
	/*---接收子组件收货地址的display----*/
	changeAddress = (status) => {
		this.setState({
			showAddress: status
		})
	};
	/*----接收子组件传过来的地址---*/
	selectAddresInfo = (info, status) => {
		this.setState({
			addressData: info,
			showBtn: true,
			showAddress: status,
			addressTip: false
		});
	};
	/*----提交下单-----*/
	submitOeder = () => {
		if (this.state.addressData <= 0) {
			this.setState({
				addressTip: true
			});
			window.scrollTo(0, 260);
			return false;
		}
		Modal.confirm({
			title: '是否确认下单？',
			okText: '确认',
			cancelText: '取消',
			width: '480px',
			content: <h5 className="text-center mt1">工品行仅提供买卖双方沟通的渠道，请自行评估交易风险</h5>,
			onOk: this.addOrder
		})
	};

	render() {
		const {addressData} = this.state;
		return (
			<Layout mainMenuIndex={'home'} menuIndex={'4'} title="提交订单">
				<aside className="bg-white p4">
					<h2>提交订单</h2>
					{/*<h4 className="inquiry-detail-buyer-info prl2 mt4">*/}
						{/*<i>买家身份：{this.state.inquiryInfo.buyerIdentity}</i>*/}
					{/*</h4>*/}
					<h4 className="mt2 prl2">
						<i>供应商信息：{this.state.quoteInfo.shopName}</i>
					</h4>
					<Divider style={{margin: '20px 0'}} />
					<div className="prl2 text-grey h5">
						{
							this.state.showBtn
								? <div>
									<div>
										<div style={{height: '30px'}}>
											<span>收货人：</span>
											<span style={{marginRight: '4px'}} className="fontAddress">{addressData[0].userName}</span>
											<span className="fontAddress">{addressData[0].userPhone}</span>
										</div>
										<div>
											<span>所在地：</span>
											<span
												className="fontAddress">{addressData[0].province + addressData[0].city + addressData[0].area + addressData[0].address}
											</span>
											<a className="upDataAddress text-primary prl1" onClick={this.addressFun.bind(this)}>更改地址</a>
										</div>
									</div>
								</div>
								:
								<Button type="primary" onClick={this.addressFun.bind(this)} size="large" className="bg-primary-linear border-radius">选择收货地址</Button>
						}
						{
							this.state.addressTip ?
								<p style={{color: '#f9486e'}} className="mt1">请选择收货地址</p>
								: null
						}
					</div>
					{/* 详细报价 */}
					<h4 className="inquiry-detail-smalltitle text-grey prl2 mt4">详细报价</h4>
					<Table ref="table"
					       className="inquiry-detail-table-inquiry mt3"
					       pagination={false}
					       rowKey={record => record.materialInquiryId}
					       rowSelection={this.rowSelection}
					       columns={this.materialColumns}
					       dataSource={this.state.quoteInfo.inquirySheetMaterials} />
					{/* 报价要求 */}
					<h5 className="mt3 prl2">
						<span className="text-muted">报价要求：</span>
						<span>
            {(() => {
              switch (this.state.quoteInfo.quoteRequirement) {
                case 0:
                  return '无要求';
                case 1:
                  return '含税 不含运费';
                case 2:
                  return '不含税 含运费';
                case 3:
                  return '含税 含运费'
              }
            })()}
          </span>
					</h5>
					<h5 className="mt2 prl2">
						<span className="text-muted">材料总价：</span>
						<span>￥{(this.state.quoteInfo.totalPrice + this.state.quoteInfo.totalTaxes).toFixed(2)}</span>
					</h5>
					{/*<h5 className="mt2 prl2">
                                  <span className="text-muted">税金总计：</span>
                                  <span>￥{this.state.quoteInfo.totalTaxes}</span>
                                </h5>*/}
					<h5 className="mt2 prl2">
						<span className="text-muted">折扣优惠：</span>
						<span>￥{this.state.quoteInfo.discountAmount}</span>
					</h5>
					<h5 className="mt2 prl2">
						<span className="text-muted">最终报价：</span>
						<span className="h2 text-info">￥{this.state.quoteInfo.finalOffer}</span>
					</h5>
					<h4 className="inquiry-detail-smalltitle text-grey prl2 mt4">订单备注</h4>
					<TextArea placeholder="请填写订单备注(选填" className="mt3" autosize={{minRows: 6, maxRows: 6}} maxLength={300}
					          onChange={this.orderNoteChange} />
					{/*操作按钮*/}
					<div className="text-center mt6">
						<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginRight: '16px'}} onClick={this.submitOeder}>提交订单</Button>
					</div>
					<Modal
						visible={this.state.showConfirmModal}
						onOk={this.addOrder}
						onCancel={() => {
							this.setState({showConfirmModal: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">是否确认下单？</h2>
						<h5 className="text-center mt1">工品行仅提供买卖双方沟通的渠道，请自行评估交易风险</h5>
					</Modal>
					{/*---选择收货地址----*/}
					<MaterialAddAdress isShowAddress={this.state.showAddress} showAddressModal={this.changeAddress.bind(this)}
					                   selectAddresInfo={this.selectAddresInfo.bind(this)} />
				</aside>
			</Layout>
		)
	}
}

export default withRouter(MyInquiryQuoteDetail)
