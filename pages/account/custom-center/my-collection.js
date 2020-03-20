// 用户中心
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Col, Icon, Modal, Pagination, Row, Table, message, Avatar, Divider} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {
	collectShopFun,
	collectMaterialFun,
	delCollectionShopFun,
	cancelMaterialCollectFun,
	delMulCollectMaterialFun,//批量删除收藏材料
	delMulCollectShopFun,//批量删除收藏店铺
} from 'server'
import cookie from 'react-cookies';
import './style.less'

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class MyCollection extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalText: '确认删除？',
			shopIsDown: false,
			total: 0,
			curPage: 0,
			status: '0', //window.sessionStorage.getItem("type") ? window.sessionStorage.getItem("type") : "0",
			curMaterialPage: 0,
			defaultPageSize: 16,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			collectShopList: [],//收藏店铺列表
			collectMaterialList: [],//收藏材料列表
			isShowDelMaterialConfirm: false,//显示删除材料确认框
			isShowDelShopConfirm: false,//显示删除店铺确认框
			isShowMulDelMaterialConfirm: false,//显示批量删除材料确认框
			isShowMulDelShopConfirm: false,//显示批量删除店铺确认框
			curMaterialId: -1,//当前要删除的材料ID
			curShopId: -1,//当前要删除的店铺ID
			curMulMaterialIds: [],//要批量删除的材料ID
			curMulShopIds: [],//要批量删除的店铺ID
			columns: [{
				title: '商家名称',
				key: 'shopName',
				width: 350,
				render: (text, record) => {
					return (
						<table>
							<tbody>
							<tr>
								<td style={{width: '40px'}}>
									{
										record.logo ?
											<Avatar src={baseUrl + record.logo} size={40} /> :
											<span className="collection-shopLogo">
                        <Avatar src={'images/bg-shop-logo.png'} size={40} />
                        <i className="h6 text-center tipText">{record.iconText}</i>
                      </span>
									}
								</td>
								<td className="prl1 text-left"><label>{record.shopName}</label></td>
							</tr>
							</tbody>
						</table>
					)
				}
			}, {
				title: '经营范围',
				key: 'operationScope',
				dataIndex: 'operationScope',
				width: 350,
				render: (text, record) => {
					return (
						<span>
                {(() => {
	                if (record.operationScope.length > 48) {
		                return (
			                <span>{record.operationScope.substr(0, 42) + '...'}</span>
		                )
	                } else {
		                return (
			                <span>{record.operationScope}</span>
		                )
	                }
                })()}
            </span>
					)
				}
			}, {
				title: '所在地',
				key: 'city',
				dataIndex: 'city',
			}, {
				title: '操作',
				key: 'action',
				render: (text, record) => {
					return (
						<a href="#" onClick={(e) => this.showDelShopConfirm(e, record.id)}>删除</a>
						// <IconFont type="iconfont-htmal5icon17" className="text-grey h0 icon-operation"
						//           onClick={(e) => this.showDelShopConfirm(e, record.id)} />
					)
				}
			}],
			columnsMaterial: [{
				title: '材料',
				key: 'name',
				width: 350,
				render: (text, record) => {
					return (
						<table>
							<tbody>
							<tr>
								<td style={{width: '40px'}}><Avatar src={record.image ? baseUrl + record.image.split(',')[0] : ''} size={40} /></td>
								<td className="prl1 text-left" style={{wordWrap: 'break-word', wordBreak: 'break-word'}}>
									<label>{record.brandName} {record.name}</label></td>
							</tr>
							</tbody>
						</table>
					)
				}
			}, {
				title: '商家',
				key: 'shopName',
				dataIndex: 'shopName',
				width: 350,
			}, {
				title: '所在地',
				key: 'city',
				dataIndex: 'city',
			}, {
				title: '操作',
				key: 'action',
				render: (text, record) => {
					return (
						<span style={{cursor: 'pointer'}} onClick={(e) => this.showDelMaterialConfirm(e, record.id)}>删除</span>
					)
				}
			}],
		}
	}

	componentDidMount() {
		this.collectShop();
		this.collectMaterial();
	}

	/**
	 * 逐条删除商铺显示弹框
	 **/
	showDelShopConfirm(e, id) {
		e.stopPropagation();
		this.setState({
			curShopId: id,
			isShowDelShopConfirm: true
		})
	}

	/**
	 * 逐条删除商铺
	 **/
	delShop = () => {
		delCollectionShopFun(this.state.userCode, this.state.curShopId).then(res => {
			if (res.result === 'success') {
				this.setState({
					shopIsDown: false,
					curShopId: '',
					isShowDelShopConfirm: false
				}, () => {
					this.collectShop()
				})
			}
		})
	};

	/**
	 * 逐条删除材料显示弹框
	 **/
	showDelMaterialConfirm = (e, id) => {
		e.stopPropagation();
		Modal.confirm({
			title: '提示',
			content: '确定删除该材料？',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				let params = {
					userCode: this.state.userCode,
					pId: id
				};
				cancelMaterialCollectFun(params).then(res => {
					if (res.result === 'success') {
						this.setState({
							curMaterialId: '',
							isShowDelMaterialConfirm: false
						}, () => {
							this.collectMaterial()
						})
					}
				})
			},
		});
	};

	/**
	 * 逐条删除材料
	 **/
	delMaterial = () => {
		let params = {
			userCode: this.state.userCode,
			pId: this.state.curMaterialId
		};
		cancelMaterialCollectFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					curMaterialId: '',
					isShowDelMaterialConfirm: false
				}, () => {
					this.collectMaterial()
				})
			}
		})
	};

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		this.setState({
			curPage: page - 1
		}, () => {
			this.collectShop();
		});
	};

	/**
	 * 收藏店铺
	 * */
	collectShop() {
		collectShopFun(this.state.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					collectShopList: res.data,
					total: res.data.length
				})
			}
		})
	}

	/**
	 * 收藏材料
	 * */
	collectMaterial() {
		collectMaterialFun(this.state.userCode, this.state.curMaterialPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					collectMaterialList: res.data,
					total: res.data.length
				})
			}
		})
	}

	/**
	 * 选择的店铺变化时记录选择的ID
	 **/
	onSelectChange = (selectedRowKeys) => {
		this.setState({curMulShopIds: selectedRowKeys});
	};

	/**
	 * 选择的材料变化时记录选择的ID
	 **/
	onMaterialSelectChange = (selectedRowKeys) => {
		this.setState({curMulMaterialIds: selectedRowKeys});
	};

	/**
	 * 批量删除材料确认框
	 **/
	showMulDelMaterialConfirm = () => {
		//需要计算剩下的材料数量是否大于当前的页数，如果下剩的材料分页小于当前的页数，当前页数-1；
		if (this.state.curMulMaterialIds.length > 0) {
			let remainingItem = this.state.total - this.state.curMulMaterialIds.length;//删除后剩余的列表数量
			if ((remainingItem / this.state.defaultPageSize) < this.state.curPage) {
				this.setState({
					curPage: this.state.curPage - 1
				}, () => {
					this.setState({
						isShowMulDelMaterialConfirm: true,
					});
				})
			} else {
				this.setState({
					isShowMulDelMaterialConfirm: true,
				});
			}
		} else {
			message.error('请选择材料！');
		}
	};

	/**
	 * 批量删除材料
	 **/
	delMulCollectMaterial = () => {
		let params = {
			userCode: this.state.userCode,
			ids: this.state.curMulMaterialIds
		};
		delMulCollectMaterialFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					curMulMaterialIds: '',
					isShowMulDelMaterialConfirm: false
				}, () => {
					this.collectMaterial()
				})
			}
		})
	};

	/**
	 * 批量删除店铺确认框
	 **/
	showMulDelConfirm = () => {
		//需要计算剩下的材料数量是否大于当前的页数，如果下剩的材料分页小于当前的页数，当前页数-1；
		if (this.state.curMulShopIds.length > 0) {
			let remainingItem = this.state.total - this.state.curMulShopIds.length;//删除后剩余的列表数量
			if ((remainingItem / this.state.defaultPageSize) < this.state.curPage) {
				this.setState({
					curPage: this.state.curPage - 1
				}, () => {
					this.setState({
						isShowMulDelConfirm: true,
					});
				})
			} else {
				this.setState({
					isShowMulDelConfirm: true,
				});
			}
		} else {
			message.error('请选择店铺！');
		}
	};

	/**
	 * 批量删除店铺
	 **/
	delMulCollectMaterial = () => {
		let params = {
			userCode: this.state.userCode,
			ids: this.state.curMulShopIds
		};
		delMulCollectShopFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					curMulMaterialIds: '',
					isShowMulDelConfirm: false
				}, () => {
					this.collectMaterial()
				})
			}
		})
	};

	//去商家详情
	shopRowOnClick = (id, state) => {
		if (state === '1') {
			Router.push({pathname: '/shop/home', query: {id: id}});
		} else if (state === '0') {
			this.setState({
				curShopId: id,
				shopIsDown: true
			})
		}
	};

	//去材料详情
	materialRowOnClick = (id, status) => {
		if (status === '1') {
			Router.push({pathname: '/material/detail', query: {id: id}});
			// window.location.href = '/#/detail/' + id;
		} else if (status === '0') {
			this.setState({
				curMaterialId: id,
				modalText: '该材料已下架，是否现在删除？',
				isShowDelMaterialConfirm: true
			})
		}
	};

	changeType = (type) => {
		this.setState({
			status: type
		});
		sessionStorage.setItem('type', type); // 存入一个值
	};

	render() {
		return (
			<Layout mainMenuIndex={'home'} menuIndex={'5'} title="我的收藏">
				<section className="bg-white">
					<div className="my-collection-tab">
						<a onClick={() => this.changeType('0')}
						   className={this.state.status === '0' ? 'active' : ''}>已收藏的商家</a>
						<a onClick={() => this.changeType('1')}
						   className={this.state.status === '1' ? 'active' : ''}>已收藏的材料</a>
					</div>
					<div className={`p3 ${this.state.status === '0' ? 'show' : 'hide'}`} style={{width: '100%'}}>
						<Table
							className="mt2"
							rowSelection={this.state.rowSelection}
							columns={this.state.columns}
							dataSource={this.state.collectShopList}
							pagination={false}
							rowKey={record => record.id}
							onRow={(record) => {
								return {
									onClick: () => this.shopRowOnClick(record.id, record.state)
								}
							}}
						/>
						<Row className="mt2">
							<Col span={2}>
								{/*<div onClick={this.showMulDelConfirm} className="text-primary ptb1">批量删除</div>*/}
							</Col>
							<Col span={3}>
								{/*<div className="text-muted ptb1">已选{this.state.curMulShopIds.length}条</div>*/}
							</Col>
							<Col>
								<Pagination style={{textAlign: 'right'}}
								            onChange={this.onCurPageChange}
								            defaultPageSize={this.state.defaultPageSize}
								            total={this.state.total}
								            showQuickJumper
								            hideOnSinglePage={true}
								/>
							</Col>
						</Row>
					</div>
					<div className={`p3 ${this.state.status === '1' ? 'show' : 'hide'}`} style={{width: '100%'}}>
						<Table
							className="mt2"
							rowSelection={this.state.rowSelectionMaterial}
							columns={this.state.columnsMaterial}
							dataSource={this.state.collectMaterialList}
							pagination={false}
							rowKey={record => record.id}
							onRow={(record) => {
								return {
									onClick: () => this.materialRowOnClick(record.id, record.status)
								}
							}}
						/>
						<Row className="mt2">
							<Col span={2}>
								{/*<div onClick={this.showMulDelMaterialConfirm} className="text-primary ptb1">批量删除</div>*/}
							</Col>
							<Col span={3}>
								{/*<div className="text-muted ptb1">已选{this.state.curMulMaterialIds.length}条</div>*/}
							</Col>
							<Col>
								<Pagination style={{textAlign: 'right'}}
								            onChange={this.onCurPageChange}
								            hideOnSinglePage={true}
								            defaultPageSize={this.state.defaultPageSize}
								            total={this.state.total}
								            showQuickJumper />
							</Col>
						</Row>
					</div>
					{/*删除收藏店铺确认框*/}
					<Modal
						visible={this.state.isShowDelShopConfirm}
						onOk={this.delShop}
						onCancel={() => {
							this.setState({isShowDelShopConfirm: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">确认删除？</h2>
					</Modal>
					{/*删除收藏材料确认框*/}
					<Modal
						visible={this.state.isShowDelMaterialConfirm}
						onOk={this.delMaterial}
						onCancel={() => {
							this.setState({isShowDelMaterialConfirm: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">{this.state.modalText}</h2>
					</Modal>
					{/*删除收藏店铺*/}
					<Modal
						visible={this.state.shopIsDown}
						onOk={this.delShop}
						onCancel={() => {
							this.setState({shopIsDown: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">该店铺已下架，是否删除？</h2>
					</Modal>
					{/*在线客服意见反馈*/}
					{/*<FixedTool/>*/}
				</section>
			</Layout>
		)
	}
}
