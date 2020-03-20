// 用户中心询价消息
import React from 'react'
import Layout from 'components/Layout/message'
import {List, Icon, Avatar, Pagination, Modal, Row, Col} from 'antd';
import {iconUrl} from 'config/evn'
import {
	timestampToTime,
	newsReadFun,
	newsDeleFun,
	newsReadAllFun,
	newsDelAllFun
} from 'server'
import {inviteMessageFun} from 'inviteApi'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class InquiryMessage extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			curType: 0,
			curPage: 0,
			list: [],
			resultTotal: 0,
			pageSize: 16,
			locale: {
				emptyText: '暂无数据',
			},
			isShowDelConfirm: false,
			newId: '',
			type: 0
		};
	}

	componentDidMount() {
		this.queryMaterialMsg();
	}

	/**
	 * 询价采购消息
	 * */
	queryMaterialMsg() {
		let params = {
			toUserCode: this.userCode,
			start: this.state.curPage
		};
		inviteMessageFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					list: res.data.list,
					resultTotal: res.data.count
				})
			}
		})
	}

	onPageChange = (pageNumber) => {
		this.setState({
			curPage: pageNumber - 1,
		}, () => {
			this.queryMaterialMsg()
		});
	};

	/*----单条设为已读消息----*/
	readNews = (list) => {
		newsReadFun(this.userCode, list.id).then(res => {
			if (res.result === 'success') {
				this.queryMaterialMsg();
			}
		})
	};

	/*-----删除单条消息---*/
	deleNews = (list) => {
		this.setState({
			isShowDelConfirm: true,
			newId: list.id,
			type: 1
		});
	};
	delOneNews = () => {
		this.setState({
			isShowDelConfirm: false,
		});
		if (this.state.type) {
			newsDeleFun(this.userCode, this.state.newId).then(res => {
				if (res.result === 'success') {
					this.queryMaterialMsg();
				}
			})
		} else {
			newsDelAllFun(this.userCode, 3).then(res => {
				if (res.result === 'success') {
					this.queryMaterialMsg();
				}
			})
		}

	};
	/*---所有消息设为已读---*/
	readNewsAll = () => {
		newsReadAllFun(this.userCode, 3).then(res => {
			if (res.result === 'success') {
				//this.queryMaterialMsg();
				 window.location.reload();
			}
		})
	};
	/*---最新消息跳转----*/
	jumpDetail = (item) => {
		this.readNews(item);
		let result = '';
		switch (item.openType) {
			case 5:
				result = `/account/custom-center/my-inquiry-detail?mid=${JSON.parse(item.params).inquirySheetId}`;
				break;
			case 6:
				result = `/account/custom-center/my-inquiry-quote-detail?shopId=${JSON.parse(item.params).shopId}&sheetId=${JSON.parse(item.params).inquirySheetId}&status=${JSON.parse(item.params).isQuote}`;
				break;
			case 7:
				// result = `/account/custom-center/my-order-detail?id=${JSON.parse(item.params).orderId}`;//`/account.html#/mallorderdetail/${JSON.parse(item.params).orderId}`;
				result = `/account/purchase/detail?id=${JSON.parse(item.params).orderId}`;//`/account.html#/mallorderdetail/${JSON.parse(item.params).orderId}`;
				break;
			case 9:
				result = '/account/custom-center/my-income-integral';//`/account.html#/myIncomeIntegral`;
				break;
			case 10:
				result = '/account/custom-center/my-income-cash';
				break;
			case 17:
            	//我的招标-我的招标详情（bidId:招标id）
                result = `/invite/mine/my-invite-detail?id=${JSON.parse(item.params).bidId}`;
                break;
            case 18:
            	//我的投标-投标详情
                result = `/invite/mine/my-bid-detail?id=${JSON.parse(item.params).id}&bidId=${JSON.parse(item.params).bidId}`;
                break;
            case 19:
                //中标公告-详情
                result = `/invite/win-detail?id=${JSON.parse(item.params).bidId}`;
                break;
            case 20:
                //招标公告-详情
                result = `/invite/detail?id=${JSON.parse(item.params).bidId}`;
                break;
		}
		if (result) {
			window.location.href = result;
		}
	};

	render() {
		return (
			<Layout mainMenuIndex="message" title="消息中心-询价消息" menuIndex={'4'}>
				<section className="bg-white" style={{paddingBottom: '40px'}}>
					<Row style={{borderBottom: '1px solid #e6e6e6', margin: '0', paddingLeft: '34px', lineHeight: '60px'}} className="h4">
						<Col span={12}>
							<span>招投标消息</span>
						</Col>
						{
							this.state.list.length > 0 ?
								<Col span={12} className="text-right text-darkgrey h5">
									<a className="prl3 text-hover show" onClick={this.readNewsAll}>
										<IconFont type="iconfont-xiaoxi" className="h0 text-muted" style={{verticalAlign: 'middle'}} />
										全部设置为已读
									</a>
									<a className="prl3 text-hover show" onClick={() => this.setState({isShowDelConfirm: true, type: 0})}>
										<IconFont type="iconfont-htmal5icon17" className="h0 text-muted" style={{verticalAlign: 'middle'}} />
										清空全部消息
									</a>
								</Col>
								: null
						}
					</Row>
					{
						this.state.list.length === 0 ?
							<div className="text-center mt2">
                <span className="show">
                    <img src={'/static/images/icon-nodata.png'} alt="" />
                </span>
							</div>
							: null
					}
					<aside className="prl6">
						<List size="large" itemLayout="horizontal"
						      className="systemNews"
						      locale={this.state.locale}
						      dataSource={this.state.list} renderItem={item => (
							<List.Item
								actions={
									item.isRead === 1 ?
										[<a className="text-info" onClick={() => this.deleNews(item)}>删除</a>]
										:
										[
											<a onClick={() => this.readNews(item)} className="text-info">设为已读</a>,
											<a className="text-primary" onClick={() => this.deleNews(item)}>删除</a>
										]
								}>
								<List.Item.Meta
									avatar={<Avatar size={50} src='/static/images/icon-bell.png' />}
									title={<span className="text-muted">{timestampToTime(item.createTime)}</span>}
									description={
										<a className={`mt1 h5 text-hover ${item.isRead === 1 ? 'text-muted' : 'text-darkgrey'}`}
										   style={{width: '80%', lineHeight: '1.2'}} onClick={() => this.jumpDetail(item)}>{item.content}</a>
									}
								/>
							</List.Item>
						)}
						/>
					</aside>
					<div className="text-center mt3">
						<Pagination showQuickJumper current={this.state.curPage + 1} total={this.state.resultTotal}
						            pageSize={this.state.pageSize} onChange={this.onPageChange.bind(this)} hideOnSinglePage={true} />
					</div>
					{/*删除消息*/}
					<Modal
						visible={this.state.isShowDelConfirm}
						onOk={this.delOneNews}
						onCancel={() => {
							this.setState({isShowDelConfirm: false})
						}}
						closable={false}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center mt4">确定要删除该消息？</h2>
						<h2 className="text-center mt2">删除后不可恢复。</h2>
					</Modal>
				</section>
			</Layout>
		)
	}
}
