// 用户中心
import React from 'react'
import Layout from 'components/Layout/account'
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import {Button, Icon, Table, Divider, Row, Col, Modal} from 'antd';
import AddInquiry from 'components/AddInquiry'
import AddBusiness from 'components/AddBusiness/'
import {iconUrl, baseUrl} from 'config/evn'
import {queryInquiryDetailFun, timestampToTime, cancelInquiryFun, userCodeFun} from 'server'
import './style.less'
import XLSX from 'xlsx-style'
import {saveAs, s2ab} from 'config/export'
import moment from 'moment'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MyInquiryDetail extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.sheetId = this.props.router.query.id;//this.props.match.params.mid;
		this.state = {
			inquiryInfo: {},
			previewVisible: false,
			showCancelInquiry: false,
			previewImage: '',
			showAddSeller: 'none',//显示添加商家
			discountDay: 0,
			owerName: '',
			isManager: '',
		};

		this.materialColumns = [{
			title: '序号',
			render(text, record, index) {
				return index + 1
			},
			dataIndex: 'materialInquiryId',
			align: 'center'
		}, {
			title: '材料名称',
			dataIndex: 'materialName',
			align: 'center'
		}, {
			title: '品牌',
			dataIndex: 'materialBrand',
			align: 'center'
		}, {
			title: '单位',
			dataIndex: 'materialUnit',
			align: 'center'
		}, {
			title: '数量',
			dataIndex: 'quantity',
			align: 'center'
		}, {
			title: '描述(规格型号)',
			dataIndex: 'remark',
			align: 'center'
		}];

		this.shopColumns = [{
			title: '序号',
			render(text, record, index) {
				return index + 1
			},
			dataIndex: 'shopId',
			align: 'center'
		}, {
			title: '公司名称',
			dataIndex: 'shopName',
			align: 'center'
		}, {
			title: '总价(含税)',
			dataIndex: 'finalPrice',
			align: 'center'
		}, {
			title: '报价有效期',
			dataIndex: 'quoteExpireTime',
			render: (text, record) => {
				return (
					record.isQuote === 1 ? timestampToTime(record.quoteExpireTime) < timestampToTime(new Date()) ? '已过期' : timestampToTime(record.quoteExpireTime) : '——'
				);
			},
			align: 'center'
		}, {
			title: '报价状态',
			render: (text, record) => {
				return (
					record.isQuote === 1 ? '已报价' : '未报价'
				);
			},
			align: 'center'
		}, {
			title: '操作',
			render: (text, record) => {
				if (record.isQuote === 1) {
					return (
						<Link
							href={{
								pathname: '/account/custom-center/my-inquiry-quote-detail',
								query: {shopId: record.shopId, sheetId: record.inquirySheetId, status: this.state.inquiryInfo.status}
							}}
						><a className="text-primary">详细报价</a></Link>
					);
				}
			},
			align: 'center'
		}];
	}

	componentDidMount() {
		this.queryInquiryDetail();
		this.getUserInfo();
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.id !== prevProps.router.query.id) {
			this.queryInquiryDetail();
			this.getUserInfo();
		}
	}

	/**
	 * 询价单详情
	 * */
	queryInquiryDetail() {
		let params = {
			userCode: this.userCode,
			inquirySheetId: this.props.router.query.id
		};
		queryInquiryDetailFun(params).then(res => {
			if (res.result === 'success') {
				let now = new Date().getTime();
				let diffDate = (res.data.validityTime - now);
				this.setState({
					inquiryInfo: res.data,
					discountDay: Math.floor(diffDate / (24 * 60 * 60 * 1000))
				});
			}
		})
	}

	/**
	 * 查看大看
	 * */
	showPreview(url) {
		this.setState({
			previewVisible: true,
			previewImage: url
		})
	}

	cancelInquiry = () => {
		cancelInquiryFun(this.userCode, this.sheetId).then(res => {
			if (res.result === 'success') {
				this.setState({
					showCancelInquiry: false
				});
				this.queryInquiryDetail();
			}
		})
	};

	/**
	 * 子组件调用--关闭添加商家面板
	 * */
	closeSeller = () => {
		let closeInfo = this.state.inquiryInfo.inquirySheetShops.filter(item => item.from === 1);
		this.state.inquiryInfo.inquirySheetShops = closeInfo;
		this.setState({
			showAddSeller: 'none',
		})
	};

	/**
	 * 发送给其它商家
	 * */
	sendToOtherBusiness = () => {
		if (this.state.inquiryInfo.inquirySheetShops.length < 5)
			this.setState({showAddSeller: 'block'});
		else
			Modal.warn({
				title: '提示',
				content: '该笔询价单发送商家的数量已达上限，请发布新的询价单。',
			});
	};

	/**
	 * 导出excel
	 * */
	exportExcel = () => {
		let shopName = '';

		//发送商家
		this.state.inquiryInfo.inquirySheetShops.forEach((item, index) => {
			shopName += item.shopName + ',';
		});

		//单元格外侧框线
		const borderAll = {
			top: {
				style: 'thin'
			},
			bottom: {
				style: 'thin'
			},
			left: {
				style: 'thin'
			},
			right: {
				style: 'thin'
			}
		};

		let workbook = {
			SheetNames: ['Sheet1'],
			Sheets: {
				Sheet1: {
					'!ref': `A1:F${this.state.inquiryInfo.inquirySheetMaterials.length + 5}`,
					'!cols': [{wpx: 100}, {wpx: 200}, {wpx: 100}, {wpx: 150}, {wpx: 150}, {wpx: 150}, {wpx: 200}],
					'!merges': [{
						s: {c: 0, r: 0},
						e: {c: 5, r: 0}
					}, /* {
                        s: {c: 1, r: 5},
                        e: {c: 5, r: 5}
                    },*/ {
						s: {c: 0, r: 5},
						e: {c: 0, r: 8}
					}],
					A1: {
						v: '询价单详情',
						t: 's',
						s: {
							font: {
								sz: 18,
								bold: true
							},
							alignment: {
								horizontal: 'center'
							}
						}
					},
					A2: {
						v: '询价单标题',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					B2: {
						v: this.state.inquiryInfo.title,
						t: 's',
						s: {
							border: borderAll
						}
					},
					C2: {
						v: '询价单编号',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					D2: {
						// v: timestampToTime(this.state.inquiryInfo.createTime),
						v: this.state.inquiryInfo.inquiryCode,
						t: 's',
						s: {
							border: borderAll
						}
					},
					E2: {
						v: '买家身份',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					F2: {
						v: this.state.inquiryInfo.buyerIdentity,
						t: 's',
						s: {
							border: borderAll
						}
					},

					A3: {
						v: '最后发送日期',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					B3: {
						v: timestampToTime(this.state.inquiryInfo.createTime),
						t: 's',
						s: {
							border: borderAll
						}
					},
					C3: {
						v: '报价截止日期',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					D3: {
						v: timestampToTime(this.state.inquiryInfo.validityTime),
						t: 's',
						s: {
							border: borderAll
						}
					},

					A4: {
						v: '发送商家',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					B4: {
						v: shopName,
						t: 's',
						s: {
							border: borderAll
						}
					},
					C4: {
						v: '报价要求',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					D4: {
						v: this.computedQuoteRequirement(),
						t: 's',
						s: {
							border: borderAll
						}
					},
					E4: {
						v: '买家备注',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					F4: {
						v: this.state.inquiryInfo.buyerNote ? this.state.inquiryInfo.buyerNote : '无',
						t: 's',
						s: {
							border: borderAll
						}
					},

					/*A5: {
							v: '收货人',
							t: 's',
							s: {
									border: borderAll,
									font: {
											bold: true
									},
									fill: {
											fgColor: {
													rgb: 'FFd3d3d3'  //背景颜色
											}
									}
							}
					},
					B5: {
							v: this.state.inquiryInfo.consigneeName,
							t: 's',
							s: {
									border: borderAll
							}
					},
					C5: {
							v: '联系电话',
							t: 's',
							s: {
									border: borderAll,
									font: {
											bold: true
									},
									fill: {
											fgColor: {
													rgb: 'FFd3d3d3'  //背景颜色
											}
									}
							}
					},
					D5: {
							v: this.state.inquiryInfo.consigneePhone,
							t: 'n',
							s: {
									border: borderAll
							}
					},

					A6: {
							v: '收货地址',
							t: 's',
							s: {
									border: borderAll,
									font: {
											bold: true
									},
									fill: {
											fgColor: {
													rgb: 'FFd3d3d3'  //背景颜色
											}
									}
							}
					},
					B6: {
							v: this.state.inquiryInfo.consigneeAddress,
							t: 's',
							s: {
									border: borderAll
							}
					},
					C6: {v: '', s: {border: borderAll}, t: 's'},
					D6: {v: '', s: {border: borderAll}, t: 's'},
					E6: {v: '', s: {border: borderAll}, t: 's'},
					F6: {v: '', s: {border: borderAll}, t: 's'},*/

					A5: {
						v: '',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					B5: {
						v: '序号',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					C5: {
						v: '材料名称',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					D5: {
						v: '品牌',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					E5: {
						v: '数量',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
					F5: {
						v: '单位',
						t: 's',
						s: {
							border: borderAll,
							font: {
								bold: true
							},
							fill: {
								fgColor: {
									rgb: 'FFd3d3d3'  //背景颜色
								}
							}
						}
					},
				}
			}
		};

		this.state.inquiryInfo.inquirySheetMaterials.forEach((item, index) => {
			workbook.Sheets.Sheet1[`A${6 + index}`] = {
				v: '询价材料',
				s: {
					border: borderAll,
					alignment: {
						vertical: 'center'
					},
					font: {
						bold: true
					},
					fill: {
						fgColor: {
							rgb: 'FFd3d3d3'  //背景颜色
						}
					}
				},
				t: 's'
			};
			workbook.Sheets.Sheet1[`B${6 + index}`] = {v: index + 1, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`C${6 + index}`] = {v: item.materialName, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`D${6 + index}`] = {v: item.materialBrand, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`E${6 + index}`] = {v: item.quantity, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`F${6 + index}`] = {v: item.materialUnit, s: {border: borderAll}, t: 's',};
		});

		const workbookOut = XLSX.write(workbook, {
			bookType: 'xlsx',
			bookSST: false,
			type: 'binary'
		});
		saveAs(new Blob([s2ab(workbookOut)], {
			type: 'application/octet-stream'
		}), '询价单详情.xlsx')
	};

	computedQuoteRequirement() {
		switch (this.state.inquiryInfo.quoteRequirement) {
			case 0:
				return '无要求';
			case 1:
				return '含税 不含运费';
			case 2:
				return '不含税 含运费';
			case 3:
				return '含税 含运费'
		}
	}

	/**
	 * 显示对应的提示框
	 * */
	showModalOfType = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: false
		})
	};

	goToInquiry = () => {
		Router.push({pathname: '/enquiry/add', query: {type: 2, id: this.sheetId}});
		// window.location.href = `/#/InquirySheet/2/${this.sheetId}`;
	};
	/*---判断是否是管理员--*/
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isManager: res.data.isManager,
				})
			}
		})
	};

	render() {
		return (
			<Layout menuIndex={'4'} mainMenuIndex={'home'} title="询价单详情">
				<section className="page-content mt1" style={{position: 'relative'}}>
					<div className="bg-white p3">
						<div className="inquiry-main-title text-ellipsis" style={{width: '80%'}}>{this.state.inquiryInfo.title}</div>
						<div className="text-grey mt2 prl3">
							{/*<span><i className="text-muted">买家身份：</i>{this.state.inquiryInfo.buyerIdentity}</span>*/}
							<span>
              <i className="text-muted">订单状态：</i>
								{(() => {
									switch (this.state.inquiryInfo.status) {
										case 0:
											return '比价中';
										case 1:
											return '已采购';
										case 2:
											return '已取消'
									}
								})()}
              </span>
						</div>
					</div>
					<div className="bg-white mt2 p3">
						<div className="inquiry-detail-sub-title">供应商报价信息</div>
						<Table ref="table"
						       pagination={false}
						       className="inquiry-detail-table-inquiry mt2"
						       rowKey={record => record.shopId}
						       rowSelection={this.rowSelection}
						       columns={this.shopColumns}
						       dataSource={this.state.inquiryInfo.inquirySheetShops} />
						<div className="inquiry-detail-sub-title mt3">材料列表</div>
						<Table ref="table"
						       className="inquiry-detail-table-inquiry mt3"
						       pagination={false}
						       rowKey={record => record.materialInquiryId}
						       rowSelection={this.rowSelection}
						       columns={this.materialColumns}
						       dataSource={this.state.inquiryInfo.inquirySheetMaterials} />
						<div className="inquiry-detail-sub-title mt3">附件图片</div>
						<div className="att-image mt2 inquiry-detail-sub-content">
							{(() => {
								if (this.state.inquiryInfo.image) {
									if (this.state.inquiryInfo.image.indexOf(',') >= 0) {
										return this.state.inquiryInfo.image.split(',').map((item, index) => {
											return (
												<span className="att-image-item" style={{backgroundImage: `url(${baseUrl + item})`}}
												      key={index}>
                          <span className="att-image-masker">
                            <IconFont type='iconfont-yanjing'
                                      onClick={() => this.showPreview(baseUrl + item)} />
                          </span>
                        </span>
											)
										})
									} else {
										return (
											<span className="att-image-item"
											      style={{backgroundImage: `url(${baseUrl + this.state.inquiryInfo.image})`}}>
                          <span className="att-image-masker">
                            <IconFont type='iconfont-yanjing'
                                      onClick={() => this.showPreview(baseUrl + this.state.inquiryInfo.image)} />
                          </span>
                      </span>
										)
									}
								} else {
									return (
										<span>无</span>
									)
								}
							})()}
						</div>
						<div className="inquiry-detail-sub-title mt3">买家备注</div>
						<div className="inquiry-detail-sub-content">
							{this.state.inquiryInfo.buyerNote || '暂无备注'}
						</div>
						<div className="inquiry-detail-sub-title mt3">询价信息</div>
						<div className="inquiry-detail-sub-content">
							<div><label>询价方式：</label><span>{this.state.inquiryInfo.type === 1 ? '邀请报价' : '公开询价'}</span></div>
							<div><label>报价要求：</label><span>{this.computedQuoteRequirement()}</span>
							</div>
							<div><label>询价单号：</label><span>{this.state.inquiryInfo.inquiryCode}</span></div>
							<div>
								<span className="text-grey">
									<i className="text-muted ">创建时间：</i>
									<i>{moment(this.state.inquiryInfo.createTime).format('YYYY-MM-DD HH:mm:ss')}</i>
								</span>
							</div>
						</div>
						{/*<div className="inquiry-detail-sub-title">询价信息</div>*/}
						{/*<div className="prl2 text-grey">*/}
						{/*<h5 className="mt3">询价单编号: <span>{this.state.inquiryInfo.inquiryCode}</span></h5>*/}
						{/*<h5 className="mt2">创建时间: <span>{timestampToTime(this.state.inquiryInfo.createTime)}</span></h5>*/}
						{/*{*/}
						{/*(() => {*/}
						{/*if (this.state.inquiryInfo.modifyTime && this.state.inquiryInfo.status === 2) {*/}
						{/*return (*/}
						{/*<h5 className="mt2">取消时间: <span>{timestampToTime(this.state.inquiryInfo.modifyTime)}</span></h5>*/}
						{/*)*/}
						{/*}*/}
						{/*})()*/}
						{/*}*/}
						{/*</div>*/}
						{/*操作按钮*/}
						{(() => {
							//发起人与管理员是同一个人
							if (this.userCode === this.state.inquiryInfo.userCode) {
								//比价中
								if (this.state.inquiryInfo.status === 0) {
									return (
										<div className="mt5 text-center">
											<AddInquiry text="再来一单"
											            size="large"
											            type="primary"
											            class="bg-primary-linear border-radius"
											            style={{marginRight: '30px'}}
											            urlParams={{type: 2, id: this.sheetId}}//`/2/${this.sheetId}`
											            shopInfo={this.state.inquiryInfo.inquirySheetShops}
											            showModalOfType={this.showModalOfType}
											/>
											<Button type="primary" size="large"
											        className="bg-primary-linear border-radius"
											        style={{marginRight: '30px'}}
											        onClick={this.sendToOtherBusiness}>发送给其它商家</Button>
											<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginRight: '30px'}} onClick={() => {
												this.setState({showCancelInquiry: true})
											}}>取消询价</Button>
											<Button type="primary" size="large" ghost style={{marginRight: '30px'}}
											        onClick={this.exportExcel}>导出询价单</Button>
											<Button type="primary" size="large" ghost
											        onClick={() => {
												        Router.push({pathname: '/account/print/inquiry', query: {id: this.props.router.query.id}})
											        }}
											>打印询价单</Button>
										</div>
									)
								} else {
									return (
										<div className="mt5 text-center">
											<AddInquiry text="再来一单"
											            size="large"
											            type="primary"
											            class="bg-primary-linear border-radius"
											            style={{marginRight: '30px'}}
											            history={this.props.history}
												// urlParams={`/2/${this.sheetId}`}
												          urlParams={{type: 2, id: this.sheetId}}//`/2/${this.sheetId}`
												          shopInfo={this.state.inquiryInfo.inquirySheetShops}
												          showModalOfType={this.showModalOfType}
											/>
											<Button type="primary" size="large" className="border-radius" onClick={this.exportExcel}
											        ghost>导出询价单</Button>
										</div>
									)
								}
							} else {
								return (
									<div className="mt5 text-center">
										<Button type="primary" size="large" className="h4" style={{marginRight: '30px'}}
										        onClick={this.exportExcel} ghost>导出询价单</Button>
										<Button type="primary" size="large" className="h4"
										        onClick={() => {
											        Router.push({pathname: '/account/print/inquiry', query: {id: this.sheetId}})
										        }}
										>打印询价单</Button>
									</div>
								)
							}
						})()}
						{/* 右上角询价单状态 */}
						<div
							className={this.state.inquiryInfo.isOverdue === 1 ? 'inquiry-detail-flag-overdue' : 'inquiry-detail-flag'}>
							<Row className={`top ${this.state.inquiryInfo.isOverdue === 1 ? 'hide' : 'show'}`}>
								<Col span={12} className="text-center">距离报价<br />截止日</Col>
								<Col span={12}><span className="day">{this.state.discountDay}</span>天</Col>
							</Row>
							<h3 className={`top-overdue ${this.state.inquiryInfo.isOverdue === 2 ? 'hide' : 'show'}`}>超过报价截止日期</h3>
							<h5 className="date">{timestampToTime(this.state.inquiryInfo.validityTime)}截止</h5>
						</div>
					</div>
					{/*显示附件大图*/}
					<Modal visible={this.state.previewVisible} footer={null} onCancel={() => {
						this.setState({previewVisible: false})
					}}>
						<img alt="example" style={{width: '100%'}} src={this.state.previewImage} />
					</Modal>
					<Modal visible={this.state.showCancelInquiry}
					       okText='确认取消'
					       cancelText='我再想想'
					       onOk={this.cancelInquiry}
					       onCancel={() => this.setState({showCancelInquiry: false})}
					       centered={true}
					>
						<h2 className="text-center ptb4 mt4">是否取消该询价单？</h2>
					</Modal>
					<AddBusiness isShowAddSeller={this.state.showAddSeller}
					             showChangeAddSeller={this.closeSeller}
					             sentMerchants={this.state.inquiryInfo.inquirySheetShops}
					             inquirySheetId={this.sheetId} sendSeller={true} />
				</section>
			</Layout>
		)
	}
}

export default withRouter(MyInquiryDetail)
