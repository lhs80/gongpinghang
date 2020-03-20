import React, {Component} from 'react';
import Link from 'next/link'
import Router from 'next/router'
import {Layout, Button, Icon, Tree, Col} from 'antd';
import {
	shopCollectFun,//收藏店铺
	cancelShopCollectFun,//取消店铺收藏
} from 'server'
import {iconUrl} from 'config/evn';
import cookie from 'react-cookies';
import dynamic from 'next/dynamic'
import './style.less'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});
const {Sider} = Layout;
const {TreeNode} = Tree;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class ShopInfo extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showConnect: 'none',
			shopIsCollect: this.props.info ? this.props.info.shopCollection : ''
		}
	}

	componentDidUpdate(nextProps) {
		if (nextProps.info !== this.props.info) {
			this.setState({
				shopIsCollect: this.props.info ? this.props.info.flag : '',
				showConnect: 'none'
			})
		}
	}

	//收藏商家
	shopCollect = () => {
		if (this.userCode && this.userCode !== 'guest') {
			let params = {
				userCode: this.userCode,
				shopId: this.props.info ? this.props.info.shopId : ''
			};
			shopCollectFun(params).then(res => {
				this.setState({
					shopIsCollect: true
				})
			})
		} else {
			Router.push({pathname: '/login/index', query: {redirectUrl: encodeURIComponent(window.location.href)}});
		}
	};

	//取消收藏商家
	cancelShopCollect = () => {
		cancelShopCollectFun(this.userCode, this.props.info ? this.props.info.shopId : '').then(res => {
			if (res.result === 'success') {
				this.setState({
					shopIsCollect: false
				})
			}
		})
	};

	jumpToProductList = (selectedKeys) => {
		Router.push({pathname: '/shop/product', query: {id: this.props.info.shopId, tid: selectedKeys}})
	};
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};
	connectCustomer = (userCode) => {
		if (cookie.load('ZjsWeb')) {
			this.setState({
				showConnect: 'block',
				shopUserCode: userCode
			})
		} else {
			Router.push('/login/index');
		}
	};

	render() {
		const {info, list} = this.props;
		const {shopIsCollect} = this.state;
		const shopCollectBtn = shopIsCollect ?
			<Button type="primary" size="large" className="h5 bg-primary-linear text-white" onClick={this.cancelShopCollect} ghost>
				<IconFont type="iconfont-shoucang" className="h3" /> 取消收藏
			</Button>
			:
			<Button type="default" size="large" className="h5" block onClick={this.shopCollect}>
				<IconFont type="iconfont-favorite" className="h3" /> 收藏店铺
			</Button>;

		return (
			<Sider width={248} style={{marginRight: '17px', background: 'transparent'}}>
				<aside className="content-top">
					{/*标题*/}
					<div className="title">
						{info ? info.shopName : ''}
						{/*<span className={`icon-level_${info.shopLevel}`}*/}
						{/*style={{display: 'inline-block', verticalAlign: 'middle', marginRight: '10px'}}/>*/}
						{/*<ShopIntegral num={info.integral}/>*/}
					</div>
					{/*内容*/}
					<div className="p3">
						<h5 className="text-darkgrey">
							<label>经营者：</label>
							<span>{info ? info.operatorName : ''}</span>
							{/*<span onClick={() => this.connectCustomer(info.userCode)}>*/}
							<a href="http://wpa.qq.com/msgrd?v=3&uin=2438518624&site=qq&menu=yes" target="_blank">
								<IconFont type="iconfont-chat" className="h3 prl1" style={{verticalAlign: 'middle', cursor: 'pointer'}} />
							</a>
							{/*</span>*/}
						</h5>
						{/*<h5 className="text-darkgrey mt3">*/}
						{/*<label>服务电话：</label>*/}
						{/*{*/}
						{/*this.userCode === 'guest'*/}
						{/*?*/}
						{/*<Link href={{pathname: '/login/index', query: {redirectUrl: ''}}}>*/}
						{/*/!*Router.router.route*!/*/}
						{/*<a className='text-primary'>登录查看</a>*/}
						{/*</Link>*/}
						{/*:*/}
						{/*info ? info.servicePhone : ''*/}
						{/*}*/}
						{/*<label>服务电话：</label>{info ? info.servicePhone : ''}*/}
						{/*</h5>*/}
						<h5 className="text-darkgrey mt3 text-ellipsis">
							<label>公司地址：</label>{info ? info.province : ''}-{info ? info.city : ''}
						</h5>
						<h5 className="text-darkgrey mt3">
							<label>供应产品：</label>{info ? info.productCount : ''}
						</h5>
						<div className="text-center mt3">
							{/*操作按钮*/}
							{shopCollectBtn}
							<Link href={{pathname: '/shop/home', query: {id: info ? info.shopId : ''}}}>
								<Button size="large" className="mt1 h5" block>
									<IconFont type="iconfont-yingshoukuan1" className="h3" />
									进入店铺
								</Button>
							</Link>
						</div>
					</div>
				</aside>
				<aside className="content-bottom">
					<h4>商品分组</h4>
					<Tree
						onSelect={this.jumpToProductList}
						onCheck={this.onCheck}
						className="mt2"
					>
						{
							list && list.map((item, index) => {
								return (
									<TreeNode title={item.name} key={item.id}>
										{
											item.childList && item.childList.map((child, key) => {
												return (
													<TreeNode title={child.name} key={child.id} />
												)
											})
										}
									</TreeNode>
								)
							})
						}
					</Tree>
				</aside>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.shopUserCode} closeModal={this.closeModal} />
			</Sider>
		);
	}
}

ShopInfo.propTypes = {};

export default ShopInfo;
