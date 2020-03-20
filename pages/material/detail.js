import React, {Fragment} from 'react'
import {Button, Icon, Layout, message, Row, Col, Divider, Breadcrumb, Popover} from 'antd';
import PageLayout from 'components/Layout/shop';
import {
	queryMaterialDetailFun,//查询店铺和材料详情
	materialCollectFun,//收藏材料
	cancelMaterialCollectFun, queryServiceInfoFun, cancelShopCollectFun, //取消材料收藏
	shopCollectFun
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import Router, {withRouter} from 'next/router';
import ShopInfo from 'components/ShopInfoSliderBar/'
import ProductInfo from './components/Product-Info/'
import ProductImage from './components/Product-Image/'
import AdvProductRight from './components/Adv-Product-Right/'
import './style.less'
import RecentView from 'components/Recent-View/';
import ProductDepictEvaluate from './components/Product-Depict-Evaluate'
import SimilarProduct from './components/Similar-Product'
import ShopIntegral from 'components/ShopIntegral/'
import dynamic from 'next/dynamic'

const {Content, Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

class MaterialDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			materialId: '',
			isUpdateCartNum: false,//是否更新头部购物车数量
			showModalOfType: false,
			materialIsCollect: false,
			showAddOfterBuyModal: false,
			shopInfo: {},
			materialInfo: {},
			classList: [],//店铺商品分类
			guessList: [],//猜你喜欢
			materialList: [],
			neteaseUserId: '',
			showConnect: 'none'
		}
	}

	componentDidMount() {
		this.queryMaterialDetail();
		this.queryServiceInfo();
	}

	queryServiceInfo() {
		queryServiceInfoFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					neteaseUserId: res.data[0].neteaseUserId
				})
			}
		})
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryMaterialDetail();
		}
	}

	//材料详情
	queryMaterialDetail() {
		if (!this.props.router.query.id) return;
		let params = {
			id: this.props.router.query.id,
			userCode: this.userCode
		};
		queryMaterialDetailFun(params).then(res => {
			if (res.data)
				this.setState({
					shopInfo: {
						...res.data.shopInfo
					},
					materialInfo: {
						...res.data.detail
					},
					classList: res.data.groupInfoList
				});
		}).catch(error => {
			message.error(error)
		})
	}

	//收藏材料
	materilCollect = () => {
		let params = {
			userCode: this.userCode,
			pId: this.props.router.query.id
		};
		if (this.userCode && this.userCode !== 'guest') {
			materialCollectFun(params).then(res => {
				if (res.result === 'success') {
					this.setState({
						materialIsCollect: true
					}, () => {
						this.queryMaterialDetail();
					})
				}
			})
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.router.query.id}
			})
		}
	};

	//取消收藏材料
	cancelMaterilCollect = () => {
		let params = {
			userCode: this.userCode,
			pId: this.props.router.query.id
		};
		cancelMaterialCollectFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					materialIsCollect: false
				}, () => {
					this.queryMaterialDetail();
				})
			}
		})
	};

	/**
	 * 隐藏常购清单确认框
	 * */
	hiddenOfterBuyModal = () => {
		this.setState({
			showAddOfterBuyModal: false
		})
	};

	connectCustomer = () => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block'
			})
		} else {
			Router.push('/login/index');
		}
	};

	//收藏商家
	shopCollect = () => {
		if (this.userCode && this.userCode !== 'guest') {
			let params = {
				userCode: this.userCode,
				shopId: this.state.shopInfo ? this.state.shopInfo.shopId : ''
			};
			shopCollectFun(params).then(res => {
				this.queryMaterialDetail()
			});
		} else {
			Router.push({pathname: '/login/index', query: {redirectUrl: encodeURIComponent(window.location.href)}});
		}
	};

	//取消收藏商家
	cancelShopCollect = () => {
		cancelShopCollectFun(this.userCode, this.state.shopInfo ? this.state.shopInfo.shopId : '').then(res => {
			if (res.result === 'success') {
				this.queryMaterialDetail()
			}
		})
	};

	//更新头部购物车数量
	updateCartNum = () => {
		this.setState({
			isUpdateCartNum: true
		})
	};

	render() {
		const {shopInfo, materialInfo, classList, isUpdateCartNum} = this.state;
		const {mustAttribute} = materialInfo;
		const materialCollectBtn = materialInfo.collection === 1 ?
			<Button type="link" onClick={this.cancelMaterilCollect} className="text-black">
				<IconFont type="iconfont-shoucang" className="text-primary h3" style={{verticalAlign: 'bottom'}} />取消收藏
			</Button>
			:
			<Button type="link" onClick={this.materilCollect} className="text-grey">
				<IconFont type="iconfont-favorite" className="text-primary h2" style={{verticalAlign: 'bottom'}} /> 收藏
			</Button>;

		const shopCollectBtn = shopInfo.shopCollection ?
			<Button type="link" ghost className="text-muted" onClick={this.cancelShopCollect}>
				取消收藏
			</Button>
			:
			<Button type="link" ghost className="text-muted" onClick={this.shopCollect}>收藏店铺</Button>;

		return (
			<PageLayout title={materialInfo.name || ''}
			            shopInfo={shopInfo}
			            productId={materialInfo.id}
			            mainMenuIndex={'list'}
			            isUpdateCartNum={isUpdateCartNum}
			>
				<Fragment>
					<Row type="flex" align="middle">
						<Col span={18}>
							<Breadcrumb separator=">" className="mt1 text-grey">
								<Breadcrumb.Item>首页</Breadcrumb.Item>
								<Breadcrumb.Item href="">{materialInfo.oneName}</Breadcrumb.Item>
								<Breadcrumb.Item href="">{materialInfo.twoName}</Breadcrumb.Item>
								<Breadcrumb.Item>{materialInfo.threeName}</Breadcrumb.Item>
								<Breadcrumb.Item className="text-ellipsis"
								                 style={{width: '300px', display: 'inline-block', verticalAlign: 'bottom'}}>{materialInfo.name}</Breadcrumb.Item>
							</Breadcrumb>
						</Col>
						<Col span={6} className="text-right">
							<div className="mt1">
								<span style={{verticalAlign: 'text-bottom'}} className="text-muted">{shopInfo.shopName}</span>
								<Popover placement="bottom" content={<ul className="prl2 ptb1">
									<li>货物描述：{shopInfo.answerDescription}分</li>
									<li>服务质量：{shopInfo.serviceAttitude}分</li>
									<li>发货速度：{shopInfo.deliverySpeed}分</li>
								</ul>} trigger="hover">
									<span className="prl1"><ShopIntegral num={151} /></span>
								</Popover>
								<Divider type="vertical" style={{background: '#CCC8C8', height: '15px', verticalAlign: 'text-bottom'}} />
								<span style={{verticalAlign: 'text-bottom'}}>{shopCollectBtn}</span>
							</div>
						</Col>
					</Row>
					<aside className="shop-material-detail">
						<div>
							<ProductImage image={materialInfo.image} />
							<Row className="text-center mt1" type="flex" align="middle">
								<Col span={11}>{materialCollectBtn}</Col>
								<Col span={2} className="text-lightgrey">
									<Divider type="vertical" style={{height: '24px'}} />
								</Col>
								<Col span={11}>
									<a href="http://wpa.qq.com/msgrd?v=3&uin=2438518624&site=qq&menu=yes" target="_blank">
										<IconFont type="iconfont-qqkefu" className="text-primary h3" />
										<i className="prl1">联系客服</i>
									</a>
								</Col>
							</Row>
						</div>
						<ProductInfo info={materialInfo ? materialInfo : null}
						             shopId={shopInfo.shopId ? shopInfo.shopId : ''}
						             shopName={shopInfo.shopName ? shopInfo.shopName : ''}
						             shopUserCode={shopInfo.userCode ? shopInfo.userCode : ''}
						             updateCartNum={this.updateCartNum}
						/>
						<AdvProductRight pid={materialInfo.id} />
					</aside>
					<aside className="mt2">
						<SimilarProduct threeId={materialInfo ? materialInfo.threeId : ''} />
					</aside>
					<Layout className="product-detail mt2" style={{height: 'auto'}}>
						<ShopInfo info={shopInfo} shopId={shopInfo.shopId ? shopInfo.shopId : ''} list={classList} />
						<Content className="bg-white">
							<ProductDepictEvaluate
								brand={materialInfo.materialBrand}
								depict={materialInfo.description}
								mustAttribute={mustAttribute}
								pid={this.props.router.query.id}
							/>
						</Content>
					</Layout>
				</Fragment>
				<div className="mt2 bg-white">
					<RecentView />
				</div>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.neteaseUserId} closeModal={this.closeModal} />
			</PageLayout>
		)
	}
}

export default withRouter(MaterialDetail)
