import React, {Fragment} from 'react'
import {Button, Icon, Layout, Divider, Modal, Tree, message, Pagination} from 'antd';
import PageLayout from 'components/Layout/shop';
import {
	queryShopInfoFun,//查询店铺信息
	queryShopAtlasFun
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import Router, {withRouter} from 'next/router';
import ShopInfo from 'components/ShopInfoSliderBar/'
import './style/atlas.less'

const {Content, Sider} = Layout;
let msgBox = null;

class MaterialDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			materialId: '',
			previewVisible: false,
			showModalOfType: false,
			materialIsCollect: false,
			showAddOfterBuyModal: false,
			shopInfo: {},
			materialInfo: {},
			classList: [],//店铺商品分类
			guessList: [],//猜你喜欢
			materialList: [],
		}
	}

	componentDidMount() {
		this.queryShopInfo();
		this.queryShopAtlas();
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryShopInfo();
			this.queryShopAtlas();
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
				// commodities: res.data.commodities,
				nowImgUrl: res.data.commodities[0],
				flag: res.data.flag,
				classList: res.data.groupList
			})
		}, error => {
			console.log(error)
		})
	}

	queryShopAtlas() {
		let params = {
			shopId: this.props.router.query.id
		}
		queryShopAtlasFun(params).then(res => {
			this.setState({
				commodities: res.data,
			})
		})
	}

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
		const {shopInfo, classList, commodities} = this.state;
		return (
			<PageLayout title={shopInfo.shopName || ''}
			            shopInfo={shopInfo}
			            mainMenuIndex={'home'}>
				<Fragment>
					<Layout className="product-detail mt2" style={{height: 'auto'}}>
						<ShopInfo info={shopInfo} shopId={shopInfo.shopId ? shopInfo.shopId : ''} list={classList} />
						<Content className="bg-white p3">
							{
								commodities && commodities.map((item, index) => {
									return (
										<div className='atlas-item' key={index}>
											<img src={baseUrl + item} alt="" onClick={() => this.showPreview(baseUrl + item, index)} />
										</div>
									)
								})
							}
							{
								!(commodities && commodities.length) ?
									<div className="text-center mt8">
			              <span className="noDataImg show">
			                  <img src="/static/images/icon-nodata.png" alt="" />
			              </span>
										<p style={{marginTop: '28px'}}>暂时没有内容</p>
									</div>
									:
									''
							}
							<div className="text-right">
								{/*<Pagination defaultCurrent={1} total={commodities.length} onChange={this.onPageChange}/>*/}
							</div>
						</Content>
					</Layout>
					{/*显示附件大图*/}
					<Modal
						width="650px"
						visible={this.state.previewVisible}
						footer={null}
						onCancel={() => {
							this.setState({previewVisible: false})
						}}>
						<div className="imageViewer-content" style={{height: '600px'}}>
							<div className="arrow left-arrow">
								<Icon type="left-circle" onClick={this.previewPrev} />
							</div>
							<div className="image-box">
								<img alt="图片" style={{maxWidth: '100%', maxHeight: '100%'}} src={this.state.previewImage} />
							</div>
							<div className="arrow right-arrow">
								<Icon type="right-circle" onClick={this.previewNext} />
							</div>
						</div>
					</Modal>
				</Fragment>
			</PageLayout>
		)
	}
}

export default withRouter(MaterialDetail)
