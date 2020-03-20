import React from 'react'
import Link from 'next/link'
import {Avatar, Button, Card, Col, Divider, Input, Modal, Pagination, Row,} from 'antd'
import Layout from 'components/Layout/index'
import {
	queryNewsTypeListFun,
	queryInfoByTypeFun
} from 'server'
import {baseUrl, iconUrl} from 'config/evn'


export default class MaterialIndex extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			showModalOfType: 0,//根据用户询价状态显示对应的提示框
			typeList: [],
			newList: [],
			curTypeId: -1,
			curPage: 0,
			childIsShowSearchSuggest: false,
			pagination: {
				current: 1,
				defaultPageSize: 16,
				total: 0,
				onChange: this.onCurPageChange
			}
		}
	}

	componentDidMount() {
		this.queryNewsTypeList();
	}

	queryNewsTypeList = () => {
		queryNewsTypeListFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					typeList: res.data,
					curTypeId: res.data[0].id
				}, () => {
					this.queryInfoByType();
				})
			}
		});
	};

	queryInfoByType = () => {
		queryInfoByTypeFun(this.state.curTypeId, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					newList: res.data.list,
					pagination: {
						total: res.data.count
					}
				})
			}
		})
	};

	changeCurTypeId = (id) => {
		this.setState({
			curTypeId: id,
			curPage: 0,
			pagination: {
				current: 1
			}
		}, () => {
			this.queryInfoByType();
		})
	};

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		window.scrollTo(0, 0);
		this.setState({
			curPage: page - 1
		}, () => {
			this.queryInfoByType();
		});
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
		})
	};

	render() {
		const {newList} = this.state;
		return (
			<Layout title={'资讯'} menuIndex={'news'}>
				<section className="bg-white ptb3 mt2">
					<aside>
						<div className="prl3">
							{this.state.typeList.map((item, index) => {
								return (
									<span key={index}
									      className={`h3 prl3 ${this.state.curTypeId === item.id ? 'text-primary' : ''}`}
									      style={{cursor: 'pointer'}}
									      onClick={() => this.changeCurTypeId(item.id)}>
                      {item.name}
                  </span>
								)
							})}
						</div>
						<Divider />
					</aside>
					<aside>
						{
							newList.map((item, index) => {
								return (
									<div key={index} className="prl6">
										<Link href={{pathname: '/information/detail', query: {id: item.urlObjectId}}}>
											<Row>
												<Col span={16}>
													<div className="text-ellipsis text-darkgrey h1 text-hover">{item.title}</div>
													<h5 className="text-muted mt4">/<span className="prl2">{item.source}</span><span
														className="prl2">{item.createDate}</span>/
													</h5>
												</Col>
												<Col span={8} className="text-right">
													{
														item.imgFormat === '2' || item.imgFormat === '1' ?
															<img src={baseUrl + item.img} alt="" style={{width: '156px', height: '100px'}} />
															:
															''
													}
												</Col>
											</Row>
										</Link>
										<Divider className={`${index !== newList.length - 1 ? 'show' : 'hide'}`} />
									</div>
								)
							})
						}
					</aside>
					<aside className="prl6">
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
