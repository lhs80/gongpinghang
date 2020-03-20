import React, {Fragment} from 'react'
import PageLayout from 'components/Layout/shop'
import {Icon, Button, Modal, message, Layout} from 'antd';
import 'swiper/dist/css/swiper.min.css'
import {
	queryShopInfoFun,//商铺信息
	shopCollectFun,//收藏商铺
	cancelShopCollectFun,//取消收藏商铺
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import Router, {withRouter} from 'next/router'
import Link from 'next/link'
import ShopInfo from 'components/ShopInfoSliderBar';
import './style/home.less'
import './style/atlas.less'
import MaterialGoodsList from './components/Material-Item';

const {Content} = Layout;
let msgBox = null;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ShopIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			previewImageIndex: -1,
			shopId: '',
			flag: false,//店铺是否收藏
			showModalOfType: false,//显示立即询价结果提示框
			menuId: 'info',
			shopInfo: {},//商家信息
			products: [],//材料列表
			commodities: [],
			nowImgUrl: [],//当前显示的图集图片
			classList: [],
			pagination: {
				hideOnSinglePage: true,
				defaultCurrent: 1,
				total: 0,
				pageSize: 12
			}
		}
	}

	static async getInitialProps({req, query}) {
		const shopId = query.id;
		return {shopId}
	}

	componentDidMount() {
		//商家信息
		this.queryShopInfo();
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryShopInfo();
		}
	}

	//商家信息
	queryShopInfo() {
		let params = {
			id: this.props.router.query.id,
			userCode: this.userCode
		};
		queryShopInfoFun(params).then(res => {
			this.setState({
				shopInfo: {
					...res.data
				},
				commodities: res.data.commodities,
				nowImgUrl: res.data.commodities[0],
				classList: res.data.groupList,
				flag: res.data.flag
			})
		}, error => {
			console.log(error)
		})
	}

	/**
	 * 查看大看
	 * */
	showPreview(url, index) {
		this.setState({
			previewImageIndex: index,
			previewVisible: true,
			previewImage: url
		})
	}

	/**
	 * 关闭立即询价结果提示框
	 * */
	closeChildModal = () => {
		this.setState({
			showModalOfType: false
		})
	};

	/**
	 * 显示对应的提示框
	 * */
	showModalOfType = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	//查看大图上一个
	previewPrev = () => {
		if (this.state.previewImageIndex - 1 >= 0) {
			this.setState({
				previewImage: baseUrl + this.state.commodities[this.state.previewImageIndex - 1],
				previewImageIndex: this.state.previewImageIndex - 1
			})
		} else {
			if (!msgBox)
				msgBox = message.info('已经是第一张啦！', 0.2, () => {
					msgBox = null;
				});
		}
	};

	//查看大图下一个
	previewNext = () => {
		if (this.state.previewImageIndex + 1 <= this.state.commodities.length - 1) {
			this.setState({
				previewImage: baseUrl + this.state.commodities[this.state.previewImageIndex + 1],
				previewImageIndex: this.state.previewImageIndex + 1
			})
		} else {
			if (!msgBox)
				msgBox = message.info('已经是最后一张啦！', 0.2, () => {
					msgBox = null;
				});
		}
	};

	render() {
		const {shopInfo, classList} = this.state;
		return (
			<PageLayout shopInfo={shopInfo}
			            mainMenuIndex={'home'} title="店铺详情">
				<Layout className="product-detail mt2" style={{height: 'auto'}}>
					<ShopInfo info={shopInfo} shopId={shopInfo.shopId ? shopInfo.shopId : ''} list={classList} />
					<Content>
						<section className="shop-wrapper">
							{/*店铺信息*/}
							<aside className="shop-info">
								<h6 style={{color: '#999999'}}>店铺公告</h6>
								<div className="shop-notice">
									<label><IconFont type="iconfont-tongzhi2" className="h1" /></label>
									<span className="prl2">
									{this.state.shopInfo.notice ? this.state.shopInfo.notice : '暂无'}
								</span>
								</div>
								<table className="shopInfo-table">
									<tbody>
									<tr>
										<td className="title">店铺名称</td>
										<td>{this.state.shopInfo.shopName ? this.state.shopInfo.shopName : '暂无'}</td>
									</tr>
									<tr>
										<td className="title">联系人</td>
										<td>{this.state.shopInfo.operatorName ? this.state.shopInfo.operatorName : '暂无'}</td>
									</tr>
									{/*<tr>*/}
										{/*<td className="title">联系电话</td>*/}
										{/*<td>*/}
											{/*{*/}
												{/*this.userCode === 'guest'*/}
													{/*?*/}
													{/*<Link href={{pathname: '/login/index', query: {redirectUrl: ''}}}>*/}
														{/*/!*Router.router.route*!/*/}
														{/*<a className='text-primary'>登录查看</a>*/}
													{/*</Link>*/}
													{/*:*/}
													{/*this.state.shopInfo.servicePhone*/}
											{/*}*/}
										{/*</td>*/}
									{/*</tr>*/}
									<tr>
										<td className="title">公司地址</td>
										<td>{`${this.state.shopInfo.province}${this.state.shopInfo.city}${this.state.shopInfo.address}`}</td>
									</tr>
									<tr>
										<td className='title'>公司介绍</td>
										<td>{this.state.shopInfo.introduce ? this.state.shopInfo.introduce : '暂无'}</td>
									</tr>
									<tr>
										<td className="title">经营范围</td>
										<td>{this.state.shopInfo.operationScope}</td>
									</tr>
									</tbody>
								</table>
							</aside>
						</section>
						<div className="bg-white mt2">
							<div className="prl2 h4" style={{paddingTop: '30px',marginBottom:'-20px'}}><b>最新产品</b></div>
							<MaterialGoodsList materialList={shopInfo.productList} num={3} />
						</div>
					</Content>
				</Layout>
			</PageLayout>
		)
	}
}

export default withRouter(ShopIndex);
