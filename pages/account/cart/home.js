// 我的进货单
import React, {Component, Fragment} from 'react';
import Router from 'next/router'
import Link from 'next/link'
import PageLayout from 'components/Layout/cart';
import {querycartList, delCartItem, updateCartItemNum, materialCollectFun, addOftenMaterialFun} from 'server'
import {Avatar, Checkbox, message, Row, Table, Button, Icon, Input, Modal} from 'antd'
import cookie from 'react-cookies';
import {baseUrl, iconUrl} from 'config/evn';
import './style.less'
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const {Column} = Table;
let msgBox = null;

function CartOpreation(props) {
	return (
		<Input
			key={props.item.id}
			addonBefore={<Button
				size="default"
				className="btn-handle"
				onClick={props.minus}
				disabled={props.item.num <= 1 || (props.item.rangePrice && props.item.num <= props.item.rangePrice[0].start)}>-</Button>}
			addonAfter={<Button
				size="default"
				className="btn-handle"
				onClick={props.add}
				disabled={props.item.num >= props.item.stock}
			>+</Button>}
			size="default"
			value={props.item.num}
			onChange={props.changeNum}
		/>
	)
}

export default class CartHome extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			cartItems: {},
			curSelectRow: [],
			totalAmount: 0,
			shopUserCode: '',
			showConnect: 'none',
			isCheckAll: false,
			selectedRowKeys: []
		}
	}

	componentDidMount() {
		this.getCartList();
	}

	getCartList = () => {
		let params = {
			userCode: this.userCode
		};
		querycartList(params).then(res => {
			this.setState({
				cartItems: res.data
			})
		}).catch(error => {
			message.error(error)
		})
	};

	//删除单个商品
	del = (id) => {
		Modal.confirm({
			title: '删除商品?',
			content: '是否确定删除商品，删除后无法恢复',
			okText: '确认',
			cancelText: '取消',
			icon: <Icon type="exclamation-circle" className="text-primary" />,
			onOk: () => {
				let params = {
					list: id
				};
				delCartItem(params).then(res => {
					if (res.result === 'success') {
						this.getCartList();
						this.setState({
							curSelectRow: [],
							totalAmount: 0
						})
					}
				}).catch(error => {
					message.error(error)
				})
			}
		});
	};

	//删除所有商品
	delAll = () => {
		let id = [];
		this.state.curSelectRow.forEach(item => {
			id.push(item.productCartId)
		});
		let params = {
			list: id
		};
		delCartItem(params).then(res => {
			if (res.result === 'success') {
				this.getCartList();
				this.setState({
					curSelectRow: [],
					totalAmount: 0
				})
			}
		}).catch(error => {
			message.error(error)
		})
	};

	//数量增加操作
	add = (index) => {
		const {specs} = this.state;
		specs[index].num = Number(specs[index].num) + 1;
		specs[index].totalPrice = specs[index].num * specs[index].price;
		this.setState({
			specs,
			isExpand: true,
		})
	};

	//数量减少操作
	minus = (index) => {
		const {specs} = this.state;
		specs[index].num = Number(specs[index].num) - 1;
		specs[index].totalPrice = specs[index].num * specs[index].price;
		this.setState({
			specs,
			isExpand: true,
		})
	};

	//数量变化操作
	changeNum = (num, id, stock, startNum) => {
		setTimeout(() => {
			const reg = /^\d+$/;
			if ((!Number.isNaN(num) && reg.test(num)) || num === '' || num === '-') {
				if (num >= stock) num = stock;
				if (startNum && num <= startNum[0].start) num = startNum[0].start;
				if (num === '' || num === '0') num = 1;
				let params = {
					productCartId: id,
					num: num
				};
				updateCartItemNum(params).then(res => {
					if (res.result === 'success') {
						this.getCartList();
						const {curSelectRow} = this.state;
						let newList = curSelectRow.findIndex(item => item.productCartId === id);
						if (curSelectRow.length && newList >= 0) {
							curSelectRow[newList].num = num;
							this.setState({
								curSelectRow
							}, () => {
								let total = 0;
								this.state.curSelectRow.forEach((item, index) => {
									total += item.num * item.price;
								});
								this.setState({
									totalAmount: total
								})
							})
						}
					}
				}).catch(error => {
					message.error(error)
				})
			}
		}, 200);
	};

	submit = () => {
		const shopId = this.state.curSelectRow[0].shopId;
		const curItem = this.state.cartItems.list.filter(item => item.shopId === shopId)[0];
		let isLtStartSale = false;

		this.state.curSelectRow.forEach(item => {
			if (item.num < item.startSale) {
				isLtStartSale = true;
				return false;
			}
		});
		if (isLtStartSale) {
			Modal.confirm({
				title: '提示',
				content: '商品小于起批量，请重新选择！',
				cancelButtonProps: {style: {display: 'none'}},
				okText: '确认',
				cancelText: '取消',
			});
			return false;
		}
		// 替换字段image为img, 与其它模块保持统一
		let tempList = JSON.stringify(this.state.curSelectRow)
			.replace(/image/g, 'img')
			.replace(/productName/g, 'name')
			.replace(/productSpecsId/g, 'specsId');
		let params = {
			shopId: shopId,
			shopName: curItem.shopName,
			list: JSON.parse(tempList)
		};
		sessionStorage.setItem('zzjcpls', this.state.selectedRowKeys);
		Router.push({pathname: '/confirm/order', query: {type: '2'}})
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

	//清除失效商品
	clear = () => {
		Modal.confirm({
			title: '提示',
			content: '确定清除失效商品？',
			okText: '确认',
			cancelText: '取消',
			onOk: () => {
				let newArray = [];
				const {overdueList} = this.state.cartItems;
				overdueList.forEach(item => {
					item.list.forEach(subItem => {
						newArray.push(subItem.productCartId)
					});
				});
				let params = {
					list: newArray
				};
				delCartItem(params).then(res => {
					this.getCartList();
				}).catch(error => {
					console.log('批量删除失效商品', error)
				})
			},
		});
	};

	//移入收藏夹
	materilCollect = (item) => {
		Modal.confirm({
			title: '移入收藏夹！',
			content: '移动后选中商品将只在收藏夹内显示',
			okText: '确认',
			cancelText: '取消',
			icon: <Icon type="exclamation-circle" className="text-primary" />,
			onOk: () => {
				let params = {
					userCode: this.userCode,
					pId: item[0].productId
				};
				if (this.userCode && this.userCode !== 'guest') {
					materialCollectFun(params).then(res => {
						let data = {
							list: [item[0].productCartId]
						};
						delCartItem(data).then(res => {
							if (res.result === 'success') {
								message.success('移入成功')
								this.getCartList();
								this.setState({
									curSelectRow: [],
									totalAmount: 0
								})
							}
						}).catch(error => {
							message.error(error)
						})
					})
				} else {
					Router.push({
						pathname: '/login/index',
						query: {redirectUrl: '/material/detail', key: 'id', value: this.props.router.query.id}
					})
				}
			}
		});
	};

	//添加常购清单
	addOftenMaterial = (data) => {
		// const {info} = this.props;
		if (this.userCode && this.userCode !== 'guest') {
			let params = {
				userCode: this.userCode,
				unit: data[0].materialUnit,
				name: data[0].productName,
				brand: data[0].materialBrand,
			};
			addOftenMaterialFun(params).then(res => {
				if (!msgBox) {
					msgBox = message.success('操作成功', 0.5, () => {
						msgBox = null;
					});
				}
			}).catch(error => {
				message.error(error)
			})
		} else {
			Router.push({
				pathname: '/login/index',
				query: {redirectUrl: '/material/detail', key: 'id', value: this.props.info.id}
			})
		}
	};

	selectAll = (e) => {
		let curSelectRow = [];
		if (e.target.checked) {
			let {selectedRowKeys} = this.state;
			this.state.cartItems.list.forEach(item => {
				item.list.forEach(cartItem => {
					let {productCartId} = cartItem;
					selectedRowKeys.push(productCartId)
					curSelectRow.push(cartItem)
				});
			});
			this.setState({
				selectedRowKeys,
				curSelectRow,
				isCheckAll: true
			}, () => {
				this.countAmount();
			});
		} else {
			this.setState({
				selectedRowKeys: [],
				curSelectRow: [],
				isCheckAll: false
			}, () => {
				this.countAmount();
			});
		}
	};

	onSelectChange = (selectedRowKeys, selectedRows) => {
		let curSelectRow = [];
		let productNum = 0;
		this.state.cartItems.list.forEach(item => {
			item.list.forEach(cartItem => {
				productNum++;
				let {productCartId} = cartItem;
				if (selectedRowKeys.indexOf(productCartId) >= 0)
					curSelectRow.push(cartItem)
			});
		});
		this.setState({
			selectedRowKeys,
			curSelectRow,
			isCheckAll: selectedRowKeys.length === productNum
		}, () => {
			this.countAmount();
		})
	};

	countAmount = () => {
		let total = 0;
		this.state.curSelectRow.forEach(item => {
			total += item.num * item.price;
		});
		this.setState({
			totalAmount: total,
		})
	};

	render() {
		const {cartItems, selectedRowKeys, isCheckAll} = this.state;
		const rowSelection = {
			selectedRowKeys,
			onChange: this.onSelectChange
		};
		return (
			<PageLayout menuIndex={'2'} mainMenuIndex={'home'} title="购物车">
				<div className="cart-warpper">
					<table className="main-title">
						<tbody>
						<tr>
							<td style={{width: '420px'}}>商品名</td>
							<td style={{width: '200px'}}>单价</td>
							<td style={{width: '200px'}}>数量</td>
							<td style={{width: '200px'}}>小计</td>
							<td style={{width: '200px'}}>操作</td>
						</tr>
						</tbody>
					</table>
					<div className="bg-white mt1">
						{
							cartItems && cartItems.list && cartItems.list.map((item, index) => {
								return (
									<Table
										className="cart-item"
										size="small"
										pagination={false}
										rowSelection={rowSelection}
										dataSource={item.list}
										key={index}
										rowKey={record => record.productCartId}
									>
										<Column
											width={360}
											title={
												<span>
										<Link href={`/shop/home?id=${item.shopId}`}>
										<a>{item.shopName}</a>
										</Link>
										<IconFont type="iconfont-liaotian" className="text-info h4"
										          onClick={() => this.connectCustomer(item.sellerUserCode)} />
										</span>
											}
											render={(text, record) => (
												<div className="product-item-name">
													<Link href={`/material/detail?id=${record.productId}`}>
														<Avatar shape="square"
														        src={record.image ? baseUrl + record.image.split(',')[0] : '/static/images/nologin.png'}
														        size={88}
														        style={{cursor: 'pointer'}}
														/>
													</Link>
													<Link href={`/material/detail?id=${record.productId}`}>
														<div style={{marginLeft: '14px', cursor: 'pointer'}}>
															<h5>{record.materialBrand} {record.productName}</h5>
															{record.optionalAttribute ?
																<div className="text-lightgrey text-left h6"
																     style={{marginTop: '5px'}}>{record.optionalAttribute}：{record.attributeValue}</div>
																:
																''
															}
														</div>
													</Link>
												</div>
											)}
										/>
										<Column
											width={200}
											dataIndex='price'
											align='center'
											render={(value, row, index) => {
												const {rangePrice, price} = row;
												let obj = {};
												let newPrice = price;
												if (rangePrice && row.num > 0) {
													newPrice = rangePrice.filter(
														item =>
															item.end === 0 && Number(item.start) <= row.num
															||
															item.end !== 0 && Number(item.start) <= row.num && Number(item.end) >= row.num
													);
													obj = {
														children: <h5>￥{newPrice.length ? newPrice[0].price : rangePrice[0].price}</h5>
													}
												} else {
													obj = {
														children: <h5>￥{newPrice}</h5>
													};
												}

												return obj;
											}}
										/>
										<Column
											width={200}
											dataIndex='num'
											align='center'
											render={(text, record, index) => <CartOpreation
												item={record}
												add={() => this.changeNum(Number(record.num) + 1, record.productCartId)}
												minus={() => this.changeNum(Number(record.num) - 1, record.productCartId)}
												changeNum={(e) => {
													this.changeNum(e.target.value, record.productCartId, record.stock, record.rangePrice)
												}}
											/>
											}
										/>
										<Column
											width={200}
											dataIndex='materialUnit'
											align='center'
											render={(text, record) => <span className="text-muted">￥{(record.num * record.price).toFixed(2)}</span>}
										/>
										<Column
											width={200}
											render={(text, record) =>
												<div style={{paddingLeft: '40px'}}>
													<a href="#" className="block" onClick={() => this.addOftenMaterial([record])}>加入常购清单</a>
													<a href="#" className="block mt1" onClick={() => this.materilCollect([record])}>移入收藏夹</a>
													<a href="#" className="block mt1" onClick={() => this.del([record.productCartId])}>删除</a>
												</div>
											}
										/>
									</Table>
								)
							})
						}
					</div>
					{
						!(cartItems && cartItems.list && cartItems.list.length) ?
							<div className="text-center ptb6">
								<div><img src="/static/images/icon-nodata.png" alt="" /></div>
								<h3 className="mt3 text-muted">购物车内还没有商品，赶紧选购吧！</h3>
							</div>
							:
							''
					}
					{
						cartItems && cartItems.overdueList && cartItems.overdueList.length ?
							<div className='sub-title'>已失效的商品</div> : ''
					}
					<div className="prl4">
						{
							cartItems && cartItems.overdueList && cartItems.overdueList.map((item, index) => {
								return (
									<Table size="small"
									       pagination={false}
									       className="cart-item"
									       rowKey={record => record.productSpecsId}
									       dataSource={item.list}
									       key={'v' + index}
									>
										<Column
											width={360}
											dataIndex='image'
											title={
												<span>
													{item.shopName}
													<IconFont type="iconfont-liaotian" className="text-info h4"
													          onClick={() => this.connectCustomer(item.sellerUserCode)} />
												</span>
											}
											render={(text, record) => (
												<div className="product-item-name">
													<Avatar shape="square"
													        src={record.image ? baseUrl + record.image : '/static/images/nologin.png'}
													        size={38} />
													<div style={{marginLeft: '14px'}}>
														<h5>{record.materialBrand} {record.productName}</h5>
														<div className="text-lightgrey text-left h6"
														     style={{marginTop: '5px'}}>{record.optionalAttribute}：{record.attributeValue}</div>
													</div>
												</div>
											)}
										/>
										<Column
											width={200}
											dataIndex='num'
											align='center'
											render={(text, record, index) => <CartOpreation
												item={record}
												add={() => this.changeNum(Number(record.num) + 1, record.productCartId)}
												minus={() => this.changeNum(Number(record.num) - 1, record.productCartId)}
												changeNum={(e) => {
													this.changeNum(e.target.value, record.productCartId)
												}}
											/>
											}
										/>
										<Column
											width={200}
											dataIndex='price'
											align='center'
										/>
										<Column
											width={200}
											dataIndex='materialUnit'
											align='center'
											render={(text, record) => <span className="text-muted">{record.num * record.price}</span>}
										/>
										<Column
											width={200}
											align='center'
											render={(text, record) =>
												<Button type='link'
												        className="text-danger"
												        onClick={() => this.del([record.productCartId])}>删除</Button>}
										/>
									</Table>
								)
							})
						}
					</div>
					<ul className="footer">
						<li className="first">
							<Checkbox onChange={this.selectAll} checked={isCheckAll}>全选</Checkbox>
							<Button type="link" className='text-danger'
							        disabled={!selectedRowKeys.length}
							        onClick={this.delAll}
							>批量删除</Button>
							<Button
								type="link"
								className='text-danger prl4'
								disabled={!(cartItems && cartItems.overdueList && cartItems.overdueList.length)}
								onClick={this.clear}>
								清除失效商品 </Button>
						</li>
						<li className="second">
							<div className="h2">
								<span className="h5">商品总价：</span>
								<span className="text-primary h0">￥{this.state.totalAmount.toFixed(2)}</span>
							</div>
							<div className="text-muted h5">已选商品{selectedRowKeys.length}件,不含运费</div>
						</li>
						<li className="third">
							{
								selectedRowKeys.length <= 0 ?
									<div className="disabled">
										去结算
									</div>
									:
									<div onClick={this.submit} className='active'>
										去结算
									</div>
							}
						</li>
					</ul>
				</div>
				<ImInfo showConnect={this.state.showConnect} userCode={this.state.shopUserCode} closeModal={this.closeModal} />
			</PageLayout>
		);
	}
}
