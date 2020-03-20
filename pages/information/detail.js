import React from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'
import PageLayout from 'components/Layout/index'
import {Avatar, Button, Card, Col, Layout, Divider, Input, Modal, Pagination, Row,} from 'antd'
import {
	detailInfoByIdFun,
	informationHotFun
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'
// import "style/material.less"
import cookie from 'react-cookies';

const {Content, Sider} = Layout;

class InformationDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			newInfo: {},
			hotList: [],
			childIsShowSearchSuggest: false,
		}
	}

	componentDidMount() {
		this.detailInfoById();
		this.informationHot();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id) {
			this.detailInfoById();
			this.informationHot();
		}
	}

	detailInfoById = () => {
		detailInfoByIdFun(this.props.router.query.id, this.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					newInfo: res.data
				})
			}
		});
	};

	informationHot = () => {
		informationHotFun().then(res => {
			this.setState({
				hotList: res.data
			})
		}).catch(error => {
			console.log('top', error)
		})

	};


	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	/**
	 * 子组件中调用,显示对应的提示框
	 * */
	showTipOfInquiry = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	render() {
		const {newInfo, hotList} = this.state;
		return (
			<PageLayout title={'资讯详情'} menuIndex={'news'}>
				<Layout className="page-content-wrapper mt1">
					<Content className="p6 bg-white">
						<div className="large text-center text-darkgrey">{newInfo ? newInfo.title : ''}</div>
						<h5
							className="text-muted text-center mt3">来源：{newInfo ? newInfo.source : ''} 时间：{newInfo ? newInfo.createDate : ''}</h5>
						<h4 className="mt5 text-darkgrey new-content" style={{lineHeight: '1.5'}}
						    dangerouslySetInnerHTML={{__html: newInfo ? newInfo.content : ''}}>{}</h4>
					</Content>
					<Sider className="p3" width="340px" style={{background: '#f8f8f8'}}>
						<div className="text-darkgrey mt4 h3"
						     style={{borderLeft: 'solid 4px #ffb432', paddingLeft: '15px'}}>今日头条
						</div>
						<div className="mt5">
							{
								hotList.length
									?
									<Link href={{pathname: '/information/detail', query: {id: hotList[0].urlObjectId}}}>
										<a>
											{
												hotList[0].imgFormat === '0'
													? ''
													: <Avatar shape="square" size={280} src={baseUrl + hotList[0].img} />
											}
											<a className="mt2 text-darkgrey h4" style={{lineHeight: '2'}}>{hotList[0].title}</a>
											<Divider className={`${hotList.length > 1 ? 'show' : 'hide'}`} />
										</a>
									</Link>
									: ''
							}
						</div>
						{
							hotList.map((item, index) => {
								if (index > 0) {
									return (
										<div key={index} className={`${index !== 1 ? 'mt1' : ''}`}>
											<Link href={{pathname: '/information/detail', query: {id: item.urlObjectId}}}>
												<a className='text-darkgrey h4'
												   style={{lineHeight: '1.5', cursor: 'pointer'}}>· {item.title}</a>
											</Link>
										</div>
									)
								}
							})
						}
					</Sider>
				</Layout>
			</PageLayout>
		)
	}
}

export default withRouter(InformationDetail)
