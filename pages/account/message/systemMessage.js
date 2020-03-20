// 用户中心系统消息
import React from 'react'
import Layout from 'components/Layout/message'
import {List, Icon, Avatar, Pagination, Row, Col, Modal} from 'antd';
import {iconUrl} from 'config/evn'
import {
	querySysMsgFun,
	queryMaterialMsgFun,
	timestampToTime,
	newsReadFun,
	newsDeleFun,
	newsReadAllFun,
	newsDelAllFun
} from 'server'
import cookie from 'react-cookies';

const {Content} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class SystemMessage extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			locale: {emptyText: '暂无数据'},
			curType: 0,
			curPage: 0,
			sysList: [],
			resultTotal: 0,
			pageSize: 16,
			isShowDelConfirm: false,
			newId: '',
			type: 0
		};
	}

	componentDidMount() {
		this.querySysMsg();
	}

	/**
	 * 系统消息
	 * */
	querySysMsg() {
		querySysMsgFun(this.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					sysList: res.data.list,
					resultTotal: res.data.count
				})
			}
		})
	}

	onPageChange = (pageNumber) => {
		this.setState({
			curPage: pageNumber - 1,
		}, () => {
			this.querySysMsg()
		});
	};
	/*----单条设为已读消息----*/
	readNews = (list) => {
		newsReadFun(this.userCode, list.id).then(res => {
			if (res.result === 'success') {
				this.querySysMsg();
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
					this.querySysMsg();
				}
			})
		} else {
			newsDelAllFun(this.userCode, 2).then(res => {
				if (res.result === 'success') {
					this.querySysMsg();
				}
			})
		}

	};
	/*---所有消息设为已读---*/
	readNewsAll = () => {
		newsReadAllFun(this.userCode, 2).then(res => {
			if (res.result === 'success') {
				// this.querySysMsg();
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
				//result = `/account.html#/myinquirydetail/${JSON.parse(item.params).inquirySheetId}`;
				result = `/account/custom-center/my-inquiry-detail?mid=${JSON.parse(item.params).inquirySheetId}`;
				break;
			case 6:
				//result = `/account.html#/myquotedetail/${JSON.parse(item.params).shopId}/${JSON.parse(item.params).inquirySheetId}/${JSON.parse(item.params).isQuote}`;
				result = `/account/custom-center/my-inquiry-quote-detail?shopId=${JSON.parse(item.params).shopId}&sheetId=${JSON.parse(item.params).inquirySheetId}&status=${JSON.parse(item.params).isQuote}`;
				break;
			case 7:
				//result = `/account.html#/mallorderdetail/${JSON.parse(item.params).orderId}`;
				result = `/account/purchase/detail?id=${JSON.parse(item.params).orderId}`;//`/account.html#/mallorderdetail/${JSON.parse(item.params).orderId}`;
				break;
			case 9:
				//result = `/account.html#/myIncomeIntegral`;
				result = '/account/custom-center/my-income-integral';//`/account.html#/myIncomeIntegral`;
				break;
			case 10:
				//result = `/account.html#/myIncomeCash`;
				result = '/account/custom-center/my-income-cash';//`/account.html#/myIncomeCash`;
				break;
			case 13:
				//result = `/account.html#/employee`;
				result = '/account/multi-account/employee/list'
				break;
		}
		if (result) {
			window.location.href = result;
		}
	};

	render() {
		return (
			<Layout title="消息中心-系统消息" mainMenuIndex="message" menuIndex={'2'}>
				<section className="bg-white" style={{paddingBottom: '40px'}}>
					<Row style={{borderBottom: '1px solid #e6e6e6', margin: '0', paddingLeft: '34px', lineHeight: '60px'}} className="h4">
						<Col span={12}>
							<span>系统消息</span>
						</Col>
						{
							this.state.sysList.length > 0 ?
								<Col span={12} className="text-right text-darkgrey h5">
									<a className="prl3 text-hover" onClick={this.readNewsAll}>
										<IconFont type="iconfont-xiaoxi" className="h0 text-muted" style={{verticalAlign: 'middle'}} />
										全部设置为已读
									</a>
									<a className="prl3 text-hover" onClick={() => this.setState({isShowDelConfirm: true, type: 0})}>
										<IconFont type="iconfont-htmal5icon17" className="h0 text-muted" style={{verticalAlign: 'middle'}} />
										清空全部消息
									</a>
								</Col>
								: null
						}
					</Row>
					{
						this.state.sysList.length === 0 ?
							<div className="text-center mt2">
	              <span className="show">
	                  <img src='/static/images/icon-nodata.png' alt="" />
	              </span>
							</div>
							: null
					}
					<aside className="prl6">
						<List size="large"
						      itemLayout="horizontal"
						      className="systemNews"
						      locale={this.state.locale}
						      dataSource={this.state.sysList} renderItem={item => (
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
				</section>
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
			</Layout>
		)
	}
}
