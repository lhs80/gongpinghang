/*----添加商家弹窗----*/
import React from 'react'
import Router from 'next/router'
import {Table, Input, Icon, Checkbox, Menu, Button, Pagination, message, Avatar, Select} from 'antd'
import {
	shopAllInfo,
	addShopInfo,
	shopCollectionFun,
	allShopsFun,
	collectionFun,
	contactFun,
	sendSellerFun,
	bigClassificationFun
} from 'server'
import {iconUrl, baseUrl} from 'config/evn'
import cookie from 'react-cookies';
import './style.less'

let timerStart = undefined;

const Search = Input.Search;
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class AddBusiness extends React.Component {
	constructor(props) {
		super(props);
		//发送商家
		this.columns = [{
			title: '名称',
			dataIndex: 'shopInfo',
			render: (shopInfo) => <div className="businessInfo">
				{
					shopInfo.logo ?
						<span className="nameDescribed show">
                            <img src={baseUrl + shopInfo.logo} alt="" />
                        </span> :
						<span className="business-shopLogo" style={{marginRight: '24px'}}>
                            <Avatar src={'images/bg-shop-logo.png'} size={40} shape="square" />
                            <i className="tipText h6 text-center text-grey">{shopInfo.iconText}</i>
                        </span>
				}

				<div className="show">
					<p className="title h5">{shopInfo.name}</p>
				</div>
			</div>,
			width: 280,
		}, {
			title: '经营范围',
			dataIndex: 'operationScope',
			width: 300,
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
			title: '地区',
			dataIndex: 'city',
			width: 100,
		}, {
			title: '操作',
			dataIndex: 'operation',
			render: (text, record) => {
				let content = '';
				if (!this.state.sentMerchants) {
					content = <IconFont type="iconfont-tianjiaadd73" className="large p1 text-plus" style={{cursor: 'pointer'}}
					                    onClick={() => this.addSeller(record)} />;
					return false;
				}
				if (!this.state.sentMerchants.length)
					content = <IconFont type="iconfont-tianjiaadd73" className="large p1 text-plus" style={{cursor: 'pointer'}}
					                    onClick={() => this.addSeller(record)} />;
				else {
					//不可以用foreach或map循环，因为无法终止循环；
					for (let i = 0; i < this.state.sentMerchants.length; i++) {
						if (record.shopName === this.state.sentMerchants[i].shopName) {
							content = this.state.sentMerchants[i].from === 1 ?
								null
								:
								<IconFont type="iconfont-jianqu" className="large p1 text-warning" style={{cursor: 'pointer'}}
								          onClick={() => this.deleteData(record.id)} />;
							break;
						} else {
							content = <IconFont type="iconfont-tianjiaadd73" className="large p1 text-plus" style={{cursor: 'pointer'}}
							                    onClick={() => this.addSeller(record)} />
						}
					}
				}
				return content;
			},
			width:
				70,
		}
		];
		//已选择商家table
		this.SelectColumns = [{
			title: '名称',
			dataIndex: 'shopInfo',
			render: (shopInfo) => <div className="businessInfo">
				{
					shopInfo.logo ?
						<span className="nameDescribed show">
                            <img src={baseUrl + shopInfo.logo} alt="" />
                        </span> :
						<span className="business-shopLogo" style={{marginRight: '24px'}}>
                            <Avatar src={'images/bg-shop-logo.png'} size={40} shape="square" />
                            <i className="tipText h6 text-center text-grey">{shopInfo.iconText}</i>
                        </span>
				}

				<div className="show">
					<p className="title h5">{shopInfo.name}</p>
				</div>
			</div>,
			width: 280,
		}, {
			title: '经营范围',
			dataIndex: 'operationScope',
			width: 300,
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
			title: '地区',
			dataIndex: 'city',
			width: 100,
		}, {
			title: '操作',
			dataIndex: 'operation',
			render: (text, record, index) => {
				return (
					<div className="operationSeller">
						{/*<Popconfirm title="确定删除吗?" onConfirm={() => this.deleteData(index)}>
                            <IconFont type="iconfont-htmal5icon17" className="add" />
                        </Popconfirm>*/}
						<IconFont type="iconfont-htmal5icon17" className="add p1" onClick={() => this.deleteData(record.id)} />
					</div>
				);
			},
			width: 70,
		}
		];
		this.state = {
			//全部、收藏、询过价的数据根据需求放到data里
			data: [],
			collectionData: [],
			contactData: [],
			current: 'all',
			loading: false,
			searchValue: '',//搜索框value
			//选择的商家
			selectBusinessData: [],
			sendBusiness: 'block',
			selectSeller: 'none',
			sellerNum: 3,
			flag: true,
			value: '',
			totalResult: 0,
			currentPage: 0,
			pageSize: 16,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			sentMerchants: this.props.sentMerchants,
			removeShopInfo: this.props.removeShopInfo,
			sendSllerList: [],
			disabled: false,
			count: 0,
			remove: false,
			bigType: [],//8大分类
			categoryId: ''
		};
	}

	componentDidMount() {
		this.allSellerData();
		this.bigType();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.isShowAddSeller === 'block') {
			this.setState({
				current: 'all',
				sentMerchants: nextProps.sentMerchants,
				count: 0,
				sendBusiness: 'block',
				selectSeller: 'none'
			});
			this.allSellerData()
		}
		if (nextProps.sendSeller) {
			for (let i in nextProps.sentMerchants) {
				nextProps.sentMerchants[i].id = nextProps.sentMerchants[i].shopId;
				nextProps.sentMerchants[i].from = 1
			}
			this.setState({
				sentMerchants: nextProps.sentMerchants
			})
		}
	}

	/**
	 * 增加商家
	 * */
	addSeller = (item) => {
		const {sentMerchants} = this.state;
		let tempSentMerchants = this.state.sentMerchants;
		item.from = 2;
		if (sentMerchants.length < 5) {
			tempSentMerchants.push(item);
			this.setState({
				sentMerchants: tempSentMerchants,
				count: this.state.count + 1
			});
		} else {
			//message.info("您选择的商家数量已达到上限")
			this.setTime('您选择的商家数量已达到上限！');
		}
	};

	/**
	 * 删除商家
	 * */
	deleteData = (id) => {
		const {sentMerchants} = this.state;
		for (let i = 0; i < sentMerchants.length; i++) {
			if (sentMerchants[i].id === id) {
				sentMerchants.splice(i, 1);
			}
		}
		this.setState({
			sentMerchants,
			count: this.state.count - 1
		});
	};

	/*----搜索框enter或者搜索时传值----*/
	searchResult = (value) => {
		this.setState({
			value: value,
			currentPage: 0,
			current: 'all',
		}, () => {
			this.searchSeller();
		});

	};
	/*-----关闭模态框----*/
	closeModal = () => {
		let status = 'none';
		this.props.showChangeAddSeller(status);
	};
	/*----选择搜索的信息--全部，收藏的，询过价的-*/
	handleSellerClick = (e) => {
		this.setState({
			current: e.key,
			value: '',
			searchValue: ''
		});

		/*---全部商家---*/
		if (e.key === 'all') {
			this.setState({
				currentPage: 0
			}, () => {
				this.allSellerData()
			})
		}
		/*---我收藏的商家----*/
		if (e.key === 'collection') {
			this.setState({
				currentPage: 0
			}, () => {
				this.collectionData()
			})
		}
		/*---询过价的商家----*/
		if (e.key === 'contact') {
			this.setState({
				currentPage: 0
			}, () => {
				this.contactFun()
			})
		}
	};

	/**
	 * 向父组件传递选中的商家
	 * */
	submitSeller = (e) => {
		this.props.sellerInfo(this.state.sentMerchants, 'none')
	};

	submitSelectSellerFun = (e) => {
		e.preventDefault();
		let sellerName = this.state.sentMerchants;
	};
	/*----询价单详情页比价中发送按钮-----*/
	sendSeller = () => {
		this.sendSellerList()
	};
	/*-----此处再次写为了都是先出现添加商品-(一选择商家提交后)--*/
	submitSellerFun = (e) => {
		e.preventDefault();
		let sellerName = this.state.sentMerchants;
		let status = 'none';
		this.props.sellerInfo(sellerName, status);
		this.setState({
			selectSeller: 'none',
			sendBusiness: 'block'
		})
	};
	/*-----点击已选择商家---*/
	selectSellerInfo = (e) => {
		e.preventDefault();
		this.setState({
			sendBusiness: 'none',
			selectSeller: 'block'
		})
	};
	/*----继续添加商家----*/
	continueAdd = (e) => {
		e.preventDefault();
		this.setState({
			sendBusiness: 'block',
			selectSeller: 'none'
		})
	};

	//全部的商铺结果
	allSellerData = () => {
		let userCode = this.state.userCode;
		/*---请求初始添加商铺所有信息---*/
		allShopsFun(this.state.currentPage, userCode).then(res => {
			if (res.result === 'success') {
				/*----全部商铺--tyyu-*/
				let data = res.data.inquiry;
				for (let i in data) {
					data[i].shopInfo = {
						name: data[i].shopName,
						logo: data[i].logo,
						iconText: data[i].iconText
					}
				}
				this.setState({
					totalResult: res.data.totalCount,
					data: data,
				});
			}
		})
	};
	//收藏的商铺
	collectionData = () => {
		let userCode = this.state.userCode;
		collectionFun(this.state.currentPage, userCode).then(res => {
			if (res.result === 'success') {
				let data = res.data.collection;
				for (let i in data) {
					data[i].shopInfo = {
						name: data[i].shopName,
						logo: data[i].logo,
						iconText: data[i].iconText
					}
				}
				this.setState({
					totalResult: res.data.totalCount,
					data: data,
				});
			}
		})
	};
	//询过价的商铺
	contactFun = () => {
		let userCode = this.state.userCode;
		contactFun(this.state.currentPage, userCode).then(res => {
			if (res.result === 'success') {
				let data = res.data.contact;
				for (let i in data) {
					data[i].shopInfo = {
						name: data[i].shopName,
						logo: data[i].logo,
						iconText: data[i].iconText
					}
				}
				this.setState({
					totalResult: res.data.totalCount,
					data: data,
				});
			}
		})
	};
	//搜索的店铺
	searchSeller = () => {
		let value = this.state.value;
		addShopInfo(value, this.state.currentPage, '', this.state.categoryId).then(res => {
			//console.log("搜索的店铺",res);
			if (res.result === 'success') {
				let data = res.data.resultList;
				for (let i in data) {
					data[i].shopInfo = {
						name: data[i].shopName,
						logo: data[i].logo,
						iconText: data[i].iconText
					}
				}
				this.setState({
					totalResult: res.data.totalCount,
					data: res.data.resultList
				});
			}
		})
	};

	/*-----点击分页-----*/
	onPageChange(pageNumber) {
		this.setState({
			currentPage: pageNumber - 1
		}, () => {
			/*-----此处先判断value不为空时代表搜索的结果，为空时代表点击(全部，收藏的，询过价的)*/
			if (this.state.value === '') {
				/*-----先判断此时选中的是(全部，收藏的，询过价的)的哪种all-全部，collection-收藏，contact-询价过的*/
				if (this.state.current === 'all') {
					this.allSellerData()
				} else if (this.state.current === 'collection') {
					this.collectionData()
				} else if (this.state.current === 'contact') {
					this.contactFun()
				}
			} else {
				this.searchSeller();
			}
		});
		let table = document.getElementsByClassName('addSellerTable')[0].getElementsByClassName('ant-table-body')[0];
		table.scrollTo(0, 0);
	}

	//转发发送商家
	sendSellerList = () => {
		const {userCode, sentMerchants} = this.state;
		let sendInfo = sentMerchants.filter(item => item.from === 2);
		let sendLength = sentMerchants.filter(item => item.from !== 2).length;
		let sendList = [];
		if (sendInfo) {
			for (let i in sendInfo) {
				sendList.push({
					shopId: sendInfo[i].id,
					shopName: sendInfo[i].shopName,
				})
			}
			//let sentMerchants = this.state.sentMerchants;
			let params = {
				userCode: userCode,
				inquirySheetId: this.props.inquirySheetId,
				shops: sendList
			};
			console.log('params', params);
			sendSellerFun(params).then(res => {
				if (res.result === 'success') {
					let len = sendInfo.length;
					let self = this;
					if (sendLength < 3) {
						if ((len + sendLength) >= 3) {
							self.setState({
								disabled: true
							});
							message.success(('发送成功！+5积分'), () => {
								Router.push({pathname: '/account/custom-center/my-inquiry'})
								// window.location.href = `/account.html#/myinquiry`
							});
						} else {
							self.setState({
								disabled: true
							});
							message.success(('发送成功'), () => {
								Router.push({pathname: '/account/custom-center/my-inquiry'})
								// window.location.href = `/account.html#/myinquiry`
							});
						}
					} else {
						self.setState({
							disabled: true
						});
						message.success(('发送成功'), () => {
							Router.push({pathname: '/account/custom-center/my-inquiry'})
							// window.location.href = `/account.html#/myinquiry`
						});
					}
				}
			})
		}
	};
	/*----搜索框值变化-----*/
	searchChange = (e) => {
		this.setState({
			searchValue: e.target.value
		})
	};
	/*---获取8大分类---*/
	bigType = () => {
		bigClassificationFun().then(res => {
			if (res.result === 'success') {
				let data = res.data;
				data.splice(0, 0, {
					name: '全部分类',
					id: ''
				});
				this.setState({
					bigType: data
				})
			}
		})
	};
	changeBigType = (value) => {
		this.setState({
			categoryId: value
		})
	};
	/*
* 倒计时
* */
	setTime = (msg) => {
		clearTimeout(timerStart);
		timerStart = setTimeout(function () {
			message.error(msg, 0.5)
		}, 500)
	};

	render() {
		const {currentPage, totalResult} = this.state;
		return (
			<section className="addBusiness" style={{display: this.props.isShowAddSeller, zIndex: '10000'}}>
				<div className="sellerWrapper commonWrapper">
					<IconFont type="iconfont-guanbi" className="closeBtn" onClick={this.closeModal.bind(this)} />
					<div style={{display: this.state.sendBusiness}}>
						<h2 className="text-center">添加商家</h2>
						<section className="mt2 sellerType">
							<Menu
								onClick={this.handleSellerClick}
								selectedKeys={[this.state.current]}
								mode="horizontal"
							>
								<Menu.Item key="all">
									全部
								</Menu.Item>
								<Menu.Item key="collection">
									我收藏的商家
								</Menu.Item>
								<Menu.Item key="contact">
									询过价的商家
								</Menu.Item>
							</Menu>
							<div className={`mt2 ${this.state.current === 'all' ? 'show' : 'hide'}`}>
								<span style={{paddingRight: '20px'}}>找商家</span>
								<Select size={'large'}
								        className="h5"
								        defaultValue="全部分类"
								        style={{width: '200px', height: '40px'}}
								        getPopupContainer={triggerNode => triggerNode.parentNode}
								        onChange={this.changeBigType}>
									{
										this.state.bigType.map((item, index) => {
											return (
												<Option value={item.id} key={index}>{item.name}</Option>
											)
										})
									}
								</Select>
								<Search
									size="large"
									style={{width: '260px', height: '40px', marginLeft: '20px'}}
									placeholder="请输入店铺名"
									value={this.state.searchValue}
									value={this.state.searchValue}
									onChange={this.searchChange}
									onSearch={this.searchResult.bind(this)}
									className="sellerSearch"
									enterButton={<IconFont type="iconfont-fangdajing" />}
								/>
							</div>
						</section>
						<Table columns={this.columns} dataSource={this.state.data} className="mt3 addSellerTable" scroll={{y: 300}}
						       pagination={false} rowKey={record => record.id}
						       ref="businessTable"
						/>

						{/*---分页---*/}
						<section className="Compagination text-center mt2" style={{margin: 'auto'}}>
							<Pagination showQuickJumper total={totalResult} current={currentPage + 1} defaultPageSize={this.state.pageSize}
							            onChange={this.onPageChange.bind(this)} hideOnSinglePage={true} />
						</section>
						<div className="text-right mt2">
							<Button style={{marginRight: '16px'}} type='primary' ghost onClick={this.selectSellerInfo.bind(this)}>
								已选择商家{
								this.state.count > 0
									? this.state.count
									: ''
							}
							</Button>
							{
								this.props.type ?
									<Button type="primary" style={{width: '120px'}} onClick={this.submitSeller.bind(this)}
									        disabled={this.state.sentMerchants.length <= 0 ? true : ''}>完成</Button>
									:
									<Button type="primary" style={{width: '120px'}} onClick={this.sendSeller.bind(this)} disabled={this.state.disabled}>发送</Button>
							}
						</div>
					</div>
					<div style={{display: this.state.selectSeller}}>
						<h2 className="text-center">
							已选择商家
							{
								this.state.count > 0
									?
									<span>({this.state.count})</span>
									: ''
							}
						</h2>
						<Table columns={this.SelectColumns} dataSource={this.state.sentMerchants ? this.state.sentMerchants.filter(item => item.from === 2) : []}
						       className="mt3 addSellerTable" scroll={{y: 300}}
						       pagination={false} rowKey={record => record.id} />
						<div className="text-right mt2">
							<Button style={{marginRight: '16px'}} className="selectSeller" onClick={this.continueAdd.bind(this)}>
								继续添加
							</Button>
							{
								this.props.type ?
									<Button type="primary" style={{width: '120px'}} onClick={this.submitSeller.bind(this)}
									        disabled={this.state.count <= 0 ? true : ''}>完成</Button>
									: <Button type="primary" style={{width: '120px'}} onClick={this.sendSeller.bind(this)} disabled={this.state.disabled}>发送</Button>
							}
						</div>
					</div>
				</div>
			</section>
		)
	}
}

export default AddBusiness
