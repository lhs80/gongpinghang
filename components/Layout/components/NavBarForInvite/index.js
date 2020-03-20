import React, {Component} from 'react';
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import {Button, Menu, Input, Icon, Divider, message, Modal} from 'antd'
import {baseUrl, businessUrl, iconUrl} from 'config/evn'
import {inviteListFun} from 'inviteApi'
import './style.less'
import cookie from 'react-cookies';
import {isInquiryFun} from 'server'

const Search = Input.Search;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class NavBarForInvite extends Component {
	constructor(props) {
		super(props);
		this.userInfo = cookie.load('ZjsWeb');
		this.state = {
			keyword: this.props.router.query.keyword ? this.props.router.query.keyword : '',
			fixedSearch: false,
			searchType: '1'
		}
	}

	componentDidMount() {
		this.affixHeader()
	}

	affixHeader = () => {
		//滚动条滚动到最底端，搜索框固定在最上面
		window.addEventListener('scroll', () => {
			let scrollTopValue = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
			let heightValue = document.body.clientHeight;

			if (scrollTopValue >= heightValue) {
				this.setState({
					fixedSearch: true
				})
			} else {
				this.setState({
					fixedSearch: false
				})
			}
		});
	};

	//搜索
	search = () => {
		console.log()
		if (this.state.searchType === '1')
			Router.push({pathname: '/invite/home', query: {keyword: this.state.keyword}});
		else
			Router.push({pathname: '/invite/win', query: {keyword: this.state.keyword}})
	};

	searchOnChange = (e) => {
		this.setState({
			keyword: e.target.value
		})
	};

	//去发布招标
	applyInvite = () => {
		if (!this.userInfo) {
			Router.push('/login')
		} else {
			isInquiryFun(this.userInfo.userCode).then(res => {
				if (res.data.isAuthCom === 1 || res.data.isAuthCom === 2) {
					Router.push('/invite/add')
				} else {
					Modal.confirm({
						title: '提示',
						okText: '立即前往',
						cancelText: '晚点再说',
						onOk() {
							Router.push('/account/multi-account/company/error');
						},
						content: (
							<div>认证企业信息之后方可投标，是否立即前往认证？</div>
						)
					});
				}
			})
		}
	};
    enterInvite = ()=>{
        if (!this.userInfo) {
            Router.push({
				pathname:'/login/index',
				query:{
					redirectUrl:'/invite/mine'
				}
			})
        } else {
            Router.push({pathname: '/invite/mine'});
        }
	}
	render() {
		return (
			<div className="shop-header">
				<aside className="page-head-wrapper maxWidth">
					<section className={`${this.state.fixedSearch ? 'page-head-searchFixed' : ''}`}>
						<div className="page-head-search maxWidth">
							<div className="page-head-search-left" style={{marginRight: '0'}}>
								<div>
									<a href="/" target="_blank"><i className="icon-logo-invite" /></a>
								</div>
							</div>
							<div className="page-head-search-right">
								<div className="search-wrapper">
									<div className={`search-type-wrapper ${this.state.showSearchType ? 'active' : ''}`}
									     onMouseEnter={() => this.setState({showSearchType: true})}
									     onMouseLeave={() => this.setState({showSearchType: false})}
									>
										<h5 className="search-type-title">
											{this.state.searchType === '2' ? '中标公告' : '招标公告'}
											<i className="iconfont iconfont-triangle-bottom h6" />
										</h5>
										<ul className="search-type">
											<li onClick={() => this.setState({
												searchType: '1',
												showSearchType: false,
												placeHolderStr: '请输入招标标题/招标单位/标的物类型'
											})}>招标公告
											</li>
											<li onClick={() => this.setState({
												searchType: '2',
												showSearchType: false,
												placeHolderStr: '请输入招标标题/招标单位/标的物类型'
											})}>中标公告
											</li>
										</ul>
									</div>
									<Search
										size="large"
										value={this.state.keyword}
										onChange={this.searchOnChange}
										style={{width: '418px'}}
										placeholder="请输入招标标题/招标单位/标的物类型"
										onSearch={this.search}
										enterButton={<span><IconFont type="iconfont-fangdajing" style={{marginTop: '-5px'}} /> 搜索</span>}
									/>
								</div>
							</div>
							<Button className="btn-recommend border-radius" onClick={this.applyInvite}>发布招标</Button>
							{/*<a href="/invite/add" className="btn-recommend text-white border-radius block text-center" target="_blank">发布招标</a>*/}
						</div>
					</section>
				</aside>
				<aside className="bg-primary-linear" style={{overflow: 'hidden'}}>
					{/*导航菜单*/}
					<div className="maxWidth">
						<Menu selectedKeys={[this.props.mainMenuIndex]} mode="horizontal" className="page-head-menu">
							<Menu.Item key="home">
								<Link href={{pathname: '/invite/home'}}>招标公告</Link>
							</Menu.Item>
							<Menu.Item key="list" className="subName">
								<Link href={{pathname: '/invite/win'}}>中标公告</Link>
							</Menu.Item>
							<Menu.Item key="inquiry" className="subName">
								<a onClick={this.enterInvite}>我的招投标</a>
								{/*<Link href={{pathname: '/invite/mine'}}>我的招投标</Link>*/}
							</Menu.Item>
						</Menu>
					</div>
				</aside>
			</div>
		)
	}
}

export default withRouter(NavBarForInvite);
