// 用户中心
import React from 'react'
import Link from 'next/link'
import Router, {withRouter} from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Icon, Table, Divider, Row, Col, Modal} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {
	quoteDetailFun,
	timestampToTime,
	queryInquiryDetailFun,
	userCodeFun
} from 'server'
import './style.less'
import cookie from 'react-cookies';
import XLSX from 'xlsx-style'
import {saveAs, s2ab} from 'config/export'
import dynamic from 'next/dynamic'

const ImInfo = dynamic(import('components/ImInfo'), {
	ssr: false,
});

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

// const ExportJsonExcel = require('js-export-excel')
class MyInquiryQuoteDetail extends React.Component {
	constructor(props) {
		super(props);
		this.shopId = this.props.router.query.shopId;//this.props.match.params.shopId;
		this.sheetId = this.props.router.query.sheetId;//this.props.match.params.sheetId;
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			this.state = {
				inquiryInfo: {},
				detail: {},
				checkedList: [],
				previewVisible: false,
				showCancelInquiry: false,
				showConnect: 'none',//显示聊天框
				previewImage: '',
				showAddSeller: 'none',//显示添加商家
				isAuthPri: ''//是否企业认证1为认证
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
		},
			// {
			// 	title: '税点',
			// 	dataIndex: 'taxRate',
			// 	align: 'center'
			// },
			// {
			// 	title: '税金',
			// 	dataIndex: 'taxes',
			// 	align: 'center'
			// },
			{
				title: '单价',
				dataIndex: 'unitPrice',
				align: 'center'
			}, {
				title: '描述',
				dataIndex: 'remark',
				align: 'center'
			},
			{
				title: '材料总价',
				dataIndex: 'totalPrice',
				align: 'center',
				render: (text, record) => {
					return (
						Number(record.totalPrice) + Number(record.taxes)
					);
				},
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
					record.isQuote === 1 ? timestampToTime(record.quoteExpireTime) : '——'
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
						<Link href={'/myquotedetail/' + record.shopId + '/' + record.inquirySheetId} className="text-primary">详细报价</Link>
					);
				}
			},
			align: 'center'
		}];
	}

	componentDidMount() {
		this.queryInquiryDetail();
		this.queryDetail();
		this.getUserInfo();
	}

	componentDidUpdate(prevProps) {
		const {pathname, query} = this.props.router;
		if (query.shopId !== prevProps.router.query.shopId && query.sheetId !== prevProps.router.query.sheetId) {
			this.queryInquiryDetail();
			this.queryDetail();
			this.getUserInfo();
		}
	}

	/**
	 * 子组件请求方法，关闭聊天框
	 * */
	closeModal = () => {
		this.setState({
			showConnect: 'none'
		})
	};

	/**
	 * 报价单详情
	 * */
	queryInquiryDetail() {
		let params = {
			shopId: this.props.router.query.shopId,
			inquirySheetId: this.props.router.query.sheetId
		};
		quoteDetailFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryInfo: res.data[0],
				});
			}
		})
	}

	/**
	 * 询价单详情
	 * */
	queryDetail() {
		let params = {
			userCode: this.userCode,
			inquirySheetId: this.props.router.query.sheetId
		};
		queryInquiryDetailFun(params).then(res => {
			if (res.result === 'success') {
				let now = new Date().getTime();
				let diffDate = (res.data.validityTime - now);
				this.setState({
					detail: res.data,
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

	/**
	 * 导出excel
	 * */
	exportExcel = () => {
		let quoteRequirement = '';
		switch (this.state.inquiryInfo.quoteRequirement) {
			case 0:
				quoteRequirement = '无要求';
				break;
			case 1:
				quoteRequirement = '含税 不含运费';
				break;
			case 2:
				quoteRequirement = '不含税 含运费';
				break;
			case 3:
				quoteRequirement = '含税 含运费';
				break;
		}

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
					'!ref': `A1:I${this.state.inquiryInfo.inquirySheetMaterials.length + 6}`,
					'!cols': [{wpx: 100}, {wpx: 200}, {wpx: 100}, {wpx: 100}, {wpx: 100}, {wpx: 120}, {wpx: 100}, {wpx: 100}, {wpx: 100}],
					'!merges': [{
						s: {c: 0, r: 0},
						e: {c: 8, r: 0}
					}, /*{
                        s: {c: 5, r: 4},
                        e: {c: 8, r: 4}
                    },*/ {
						s: {c: 7, r: 1},
						e: {c: 8, r: 1}
					}, {
						s: {c: 7, r: 2},
						e: {c: 8, r: 2}
					}],
					A1: {
						v: '报价单详情',
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
						v: '报价商家',
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
						v: this.state.inquiryInfo.shopName,
						t: 's',
						s: {
							border: borderAll
						}
					},
					C2: {
						v: '报价日期',
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
						v: timestampToTime(this.state.inquiryInfo.modifyTime),
						t: 's',
						s: {
							border: borderAll
						}
					},
					E2: {
						v: '报价有效期',
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
						v: timestampToTime(this.state.inquiryInfo.quoteExpireTime),
						t: 's',
						s: {
							border: borderAll
						}
					},
					G2: {
						v: '卖家备注',
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
					H2: {
						v: this.state.inquiryInfo.shopNote ? this.state.inquiryInfo.shopNote : '无',
						t: 's',
						s: {
							border: borderAll
						}
					},
					I2: {
						v: '',
						t: 's',
						s: {
							border: borderAll,
						}
					},

					A3: {
						v: '材料总价(元)',
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
						v: this.state.inquiryInfo.totalPrice,
						t: 'n',
						s: {
							border: borderAll
						}
					},
					C3: {
						v: '税金金额(元)',
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
						v: this.state.inquiryInfo.totalTaxes,
						t: 'n',
						s: {
							border: borderAll
						}
					},
					E3: {
						v: '优惠金额(元)',
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
					F3: {
						v: this.state.inquiryInfo.discountAmount,
						t: 'n',
						s: {
							border: borderAll
						}
					},
					G3: {
						v: '最终报价(元)',
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
					H3: {
						v: this.state.inquiryInfo.finalOffer,
						t: 'n',
						s: {
							border: borderAll
						}
					},
					I3: {
						v: '',
						t: 's',
						s: {
							border: borderAll,
						}
					},

					A4: {
						v: '询价单标题',
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
						v: this.state.detail.title,
						t: 's',
						s: {
							border: borderAll
						}
					},
					C4: {
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
					D4: {
						v: this.state.detail.inquiryCode,
						t: 's',
						s: {
							border: borderAll
						}
					},
					E4: {
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
					F4: {
						v: quoteRequirement,
						t: 's',
						s: {
							border: borderAll
						}
					},
					G4: {
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
					H4: {
						v: '',
						t: 's',
						s: {
							border: borderAll
						}
					},
					I4: {
						v: '',
						t: 's',
						s: {
							border: borderAll,
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
							v: this.state.detail.consigneeName,
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
							v: this.state.detail.consigneePhone,
							t: 'n',
							s: {
									border: borderAll
							}
					},
					E5: {
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
					F5: {
							v: this.state.detail.consigneeAddress,
							t: 's',
							s: {
									border: borderAll
							}
					},
					G5: {
							v: '',
							t: 's',
							s: {
									border: borderAll
							}
					},
					H5: {
							v: '',
							t: 's',
							s: {
									border: borderAll
							}
					},
					I5: {
							v: '',
							t: 's',
							s: {
									border: borderAll,
							}
					},*/

					A5: {
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
					B5: {
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
					C5: {
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
					D5: {
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
					E5: {
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
					F5: {
						v: '单价',
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
					G5: {
						v: '税率',
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
					H5: {
						v: '材料款(元)',
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
					I5: {
						v: '税金(元)',
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
			workbook.Sheets.Sheet1[`A${6 + index}`] = {v: index + 1, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`B${6 + index}`] = {v: item.materialName, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`C${6 + index}`] = {v: item.materialBrand, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`D${6 + index}`] = {v: item.quantity, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`E${6 + index}`] = {v: item.materialUnit, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`F${6 + index}`] = {v: item.unitPrice, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`G${6 + index}`] = {v: item.taxRate, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`H${6 + index}`] = {v: item.totalPrice, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`I${6 + index}`] = {v: item.taxes, s: {border: borderAll}, t: 'n',};
		});

		const workbookOut = XLSX.write(workbook, {
			bookType: 'xlsx',
			bookSST: false,
			type: 'binary'
		});
		saveAs(new Blob([s2ab(workbookOut)], {
			type: 'application/octet-stream'
		}), '报价单详情.xlsx')
	};
	/**
	 * 查询账号是否企业认证是否退出公司)
	 * */
	getUserInfo = () => {
		let params = {
			userCode: this.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isAuthPri: res.data.isAuthPri
				})
			}
		})
	};

	render() {
		const {inquiryInfo, isAuthPri, detail} = this.state;
		const {shopId, sheetId} = this.props.router.query;
		return (
			<Layout mainMenuIndex={'home'} title="报价单详情" menuIndex={'4'}>
				<section className="bg-white ptb4 prl3">
					<h2 className="inquiry-detail-title prl2">{inquiryInfo.shopName}</h2>
					<h4 className="inquiry-detail-buyer-info prl2 mt2">
						<i>报价日期：{timestampToTime(this.state.inquiryInfo.modifyTime)}</i>
					</h4>
					<h4 className="mt1 prl2">
						<i>报价有效期：{timestampToTime(this.state.inquiryInfo.quoteExpireTime)}</i>
					</h4>
					<Divider style={{margin: '20px 0'}} />
					{/* 详细报价 */}
					<div className="inquiry-detail-sub-title">详细报价</div>
					<Table ref="table"
					       className="inquiry-detail-table-inquiry mt3"
					       pagination={false}
					       rowKey={record => record.materialInquiryId}
					       rowSelection={this.rowSelection}
					       columns={this.materialColumns}
					       dataSource={this.state.inquiryInfo.inquirySheetMaterials} />
					{/* 报价要求 */}
					<h5 className="mt3 prl2">
						<span className="text-muted">报价要求：</span>
						<span>
									{(() => {
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
									})()}
								  </span>
					</h5>
					<h5 className="mt2 prl2">
						<span className="text-muted">材料总价：</span>
						<span>￥{(this.state.inquiryInfo.totalPrice + this.state.inquiryInfo.totalTaxes).toFixed(2)}</span>
					</h5>
					<h5 className="mt2 prl2">
						<span className="text-muted">折扣优惠：</span>
						<span>￥{this.state.inquiryInfo.discountAmount}</span>
					</h5>
					<h5 className="mt2 prl2">
						<span className="text-muted">最终报价：</span>
						<span className="h2 text-info">￥{this.state.inquiryInfo.finalOffer}</span>
					</h5>
					{/*附件图片*/}
					<div className="inquiry-detail-sub-title mt3">附件图片</div>
					<div className="att-image inquiry-detail-sub-content">
						{(() => {
							if (this.state.inquiryInfo.image) {
								if (this.state.inquiryInfo.image.indexOf(',') >= 0) {
									return this.state.inquiryInfo.image.split(',').map((item, index) => {
										return (
											<span className="att-image-item" style={{backgroundImage: `url(${baseUrl + item})`}} key={index}>
                        <span className="att-image-masker">
                          <IconFont type='iconfont-yanjing' onClick={() => this.showPreview(baseUrl + item)} />
                        </span>
                      </span>
										)
									})
								} else {
									return (
										<span className="att-image-item" style={{backgroundImage: `url(${baseUrl + this.state.inquiryInfo.image})`}}>
                      <span className="att-image-masker">
                        <IconFont type='iconfont-yanjing'
                                  onClick={() => this.showPreview(baseUrl + this.state.inquiryInfo.image)} />
                      </span>
                    </span>
									)
								}
							} else {
								return (
									<span>暂无图片</span>
								)
							}
						})()}
					</div>
					<div className="inquiry-detail-sub-title mt3">备注</div>
					<div className="inquiry-detail-sub-content">{this.state.inquiryInfo.shopNote || '暂无备注'}</div>
					{/*操作按钮*/}
					<div className="text-center mt6">
						{(() => {
							if (isAuthPri === 2) {
								if (this.state.inquiryInfo.userCode && this.userCode === this.state.inquiryInfo.userCode) {
									//未过期、比较中、已采购
									if (this.state.inquiryInfo.isOverdue !== 1 && (this.props.router.query.status === '0' || this.props.router.query.status === '1')) {
										return (
											<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginRight: '16px'}}
											        onClick={() => {
												        Router.push({pathname: '/account/custom-center/confirm-order', query: {shopId: shopId, sheetId: sheetId}})
											        }}>
												立即下单
											</Button>
										)
									}
								}
							}
						})()
						}
						{(() => {
							if (this.state.userCode === this.state.inquiryInfo.userCode) {
								return (
									<Button type="primary" size="large" className="bg-primary-linear border-radius" style={{marginRight: '16px'}} onClick={() => {
										this.setState({showConnect: 'block'})
									}}>
										<IconFont type="iconfont-kefu" className="text-white" /> 联系卖家
									</Button>
								)
							}
						})()}
						<Button type="primary" size="large" className="border-radius" style={{marginRight: '16px'}} ghost
						        onClick={this.exportExcel}>导出报价单</Button>
						<Button type="primary" size="large" className="border-radius" ghost
						        onClick={() => {
							        Router.push({pathname: '/account/print/quote', query: {shopId: shopId, sheetId: sheetId}})
						        }}
						>打印报价单</Button>
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
					<ImInfo showConnect={this.state.showConnect} userCode={this.state.inquiryInfo.neteaseUserId} closeModal={this.closeModal} />
				</section>
			</Layout>
		)
	}
}

export default withRouter(MyInquiryQuoteDetail)
