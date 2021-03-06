import React from 'react'
import Link from 'next/link'
import Layout from 'components/Layout/index'
import {Row, Col, Card, Input, Icon, Pagination, Select} from 'antd'
import {
	queryCollectBookFun,
	timestampToTime,
	bookCancelFavourFun,
	bookAddFavourFun
} from 'server'
import './book.less'
import cookie from 'react-cookies';
import {iconUrl} from 'config/evn'

const {Content} = Layout;
const {Meta} = Card;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class BookIndex extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			childIsShowSearchSuggest: false,
			curPage: 0,
			bookList: [],
			pagination: {
				current: 1,
				defaultPageSize: 16,
				total: 0,
				onChange: this.onCurPageChange
			}
		}
	}

	componentDidMount() {
		this.getBookList();
	}

	/**
	 * 书籍列表
	 **/
	getBookList = () => {
		queryCollectBookFun(this.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					bookList: res.data.list,
					pagination: {
						total: res.data.count
					}
				})
			}
		})
	};

	/**
	 * 页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		window.scrollTo(0, 0);
		this.setState({
			curPage: page - 1
		}, () => {
			this.getBookList();
		});
	};

	/**
	 * 添加收藏
	 **/
	addCollect = (e, id) => {
		e.preventDefault();
		bookAddFavourFun(id, this.userCode).then(res => {
			if (res.result === 'success') {
				this.getBookList();
			}
		})
	};

	/**
	 * 取消收藏
	 **/
	cancelCollect = (e, id) => {
		e.preventDefault();
		bookCancelFavourFun(id, this.userCode).then(res => {
			if (res.result === 'success') {
				this.getBookList();
			}
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
		const {parentType, curParentType, bookList, keyword} = this.state;
		return (
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务">
				<section className="page-content-wrapper bg-white mt2">
					<aside className="mt3 prl3 book-panel">
						<Row gutter={20} className="mt1">
							{
								bookList.map((item, index) => {
									return (
										<Col span={12} key={index} className={`${index > 1 ? 'mt2' : ''}`}>
											<Link href={`/content/${item.postId}`}>
												<Card>
													<Meta
														avatar={
															item.flag ?
																<div className="text-center" onClick={(e) => this.cancelCollect(e, item.postId)}>
																	<h6 className='flag active'><IconFont type="iconfont-collection-b" /></h6>
																	<h5 className="text-muted">已收藏</h5>
																</div>
																:
																<div className="text-center" onClick={(e) => this.addCollect(e, item.postId)}>
																	<h6 className="flag"><IconFont type="iconfont-collection-b" /></h6>
																	<h5 className="text-muted">收藏</h5>
																</div>
														}
														title={<div className="text-darkgrey text-ellipsis h3" style={{marginTop: '2px'}}>{item.bookName}</div>}
														description={<div className="text-muted h6"
														                  style={{marginTop: '9px'}}>编号：{item.number} 发表时间：{timestampToTime(item.publishTime)}</div>}
													/>
												</Card>
											</Link>
										</Col>
									)
								})
							}
						</Row>
					</aside>
					<aside className="prl3 ptb2">
						<Pagination
							{...this.state.pagination}
							showQuickJumper
							hideOnSinglePage={false}
							className="mt6"
							style={{textAlign: 'right', marginBottom: '30px'}}
							onChange={this.onCurPageChange}
						/>
					</aside>
				</section>
			</Layout>
		)
	}
}
