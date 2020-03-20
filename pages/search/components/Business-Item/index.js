import React, {Component} from 'react'
import {Row, Col, Icon} from 'antd'
import cookie from 'react-cookies'
import {isInquiryFun, userInfoFun, userCodeFun, personalCenterFun, payByAlipayFun} from 'server'
import AddInquiry from 'components/AddInquiry'
import Router, {withRouter} from 'next/router'

class GoodsList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			totalInfo: 200,
			rz: '已认证',
			notRz: '未认证',
			away: '',
			showSale: true,
			userInfo: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb') : null,
			visible: false,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			isAutherCom: '',
			personalVisible: false,
			sellerVisible: false,
			loading: true,
			childIsShowSearchSuggest: false,
		}
	}

	/**
	 * 子组件中调用,显示对应的提示框
	 * */
	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	/*------跳转到店铺页面----*/
	jumpShop = (item) => {
		this.props.history.push(`/shopinfo/${item.shopId}`)
	};

	componentDidMount() {
		const {userCode} = this.state;
		let params = {
			userCode
		}
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isAutherCom: res.data.isAuthCom,
				})
			}
		})
	};

	goToShopDetail = (id) => {
		Router.push({pathname: '/shop/home', query: {id: id}})
	};


	render() {
		const {shopDataList, searchTotal, searchKeyWord} = this.props;

		return (
			<section>
				{
					shopDataList && shopDataList.list && shopDataList.list.length > 0 ?
						shopDataList.list.map((item, index) => {
							return (
								<div className="shop-item" key={index}>
									{/*onClick={() => this.goToShopDetail(item.shopId)}*/}
									<div className="content">
										<Row>
											<Col span={12}>
												<b className="h4 text-darkgrey"><a href={`/shop/home?id=${item.shopId}`}>{item.shopName}</a></b>
												<span className="h6 text-lightgrey prl1">{item.province + '-' + item.city}</span>
											</Col>
											<Col span={12} className="h6 text-lightgrey text-right">
												<i className="iconfont iconfont-fasong h5" />
												<i className="prl1">{(item.distance).toFixed(2)}km</i>
											</Col>
											<Col span={24} className="text-ellipsis mt1" style={{width: '750px'}}>
												<span className="text-lightgrey">主营：</span>
												<span className="text-darkgrey">{item.operationScope}</span>
											</Col>
										</Row>
									</div>
									<div className="middle">
										<h6 className="text-darkgrey">
											<span className="text-lightgrey">近30天成交：</span>
											<span className="text-primary">{item.monOrderCount}</span>笔
										</h6>
										<h6 className="mt1 text-darkgrey">
											<span className="text-lightgrey">近30天报价：</span>
											<span className="text-primary">{item.monInquiryCount}</span>次
										</h6>
									</div>
									<div className="right">
										<AddInquiry text={'立即询价'}
										            icon={'iconfont-xunjia'}
										            iconClass={'h3'}
										            urlParams={{type: 0, shopId: item.shopId}}
										/>
									</div>
								</div>
							)
						})
						:
						this.props.isLoading ?
							<div className="text-center mt6">
								<h3>
									<Icon type="loading" /> 数据加载中
								</h3>
							</div>
							:
							<div className="material-list-empty">
								<div className="icon-nodata img" />
								<div className="content">
									<h4 className="text-darkgrey">商品正在上架，敬请期待，如急需请联系客服</h4>
									<h5 className="text-lightgrey">您可以：</h5>
									<h5 className=" text-lightgrey">1. 缩短或修改您的搜索词，重新搜索；</h5>
									<h5 className=" text-lightgrey">2. 写下您的采购需求，快速获得多个供应商报价。</h5>
									<AddInquiry type={'primary'}
									            size="large"
									            text={'发布询价'}
									            showModalOfType={this.showModalOfType}
									            urlParams={`/0/${this.shopId}`}
									            icon="iconfont-xunjia"
									            iconClass="h3"
									/>
								</div>
							</div>
				}
			</section>
		)
	}
}

export default withRouter(GoodsList)
