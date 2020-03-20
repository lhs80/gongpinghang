// 用户中心
import React from 'react'
import Router from 'next/router'
import Layout from 'components/Layout/account'
import {Button, Col, Icon, Modal, Pagination, Row, Table, message, Form, Input} from 'antd';
import AddMaterialForMyInquiry from './components/AddMaterialForMyInquiry'
import AddInquiry from 'components/AddInquiry/'
import {iconUrl} from 'config/evn'
import {regularPurchaseFun, isInquiryFun, delMaterialFun, delMulMaterialFun, unitListFun} from 'server'
import cookie from 'react-cookies';
import XLSX from 'xlsx-style'
import {saveAs, s2ab} from 'config/export'
// import FixedTool from 'component/FixedTool/'

let timerStart = undefined;

const {Content} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class OftenShop extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			total: 0,
			curPage: 0,
			defaultPageSize: 16,
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			oftenShopList: [],//常购材料列表
			units: [],//材料单位列表
			isShowDelConfirm: false,//显示删除材料确认框
			isShowMulDelConfirm: false,//批量显示删除材料确认框
			showModalOfType: false,//显示立即询价结果提示框
			tipOfAddMaterial: false,//添加材料弹框
			curMaterialId: -1,//当前要删除的材料ID
			curMulMaterialIds: [],//要批量删除的材料ID
			exportList: [],//要导出的材料列表
			selectIndex: '',
			messageTip: true,
			count: 6,
			columns: [{
				title: '材料名称',
				key: 'name',
				dataIndex: 'name',
				width: '50%',
				render: (text, record) => (
					<div style={{ wordWrap: 'break-word', wordBreak: 'break-word' }}>
						{text}
					</div>
				),
			}, {
				title: '品牌',
				key: 'brand',
				dataIndex: 'brand',
				width: '30%',
				render: (text, record) => {
					return (
						<span>
                {
	                record.brand ?
		                <span>{record.brand}</span>
		                :
		                <span>-</span>
                }
            </span>
					)
				}
			}, {
				title: '单位',
				key: 'unit',
				dataIndex: 'unit',
				width: '10%'
			}, {
				title: '操作',
				key: 'action',
				align: 'center',
				width: '10%',
				render: (text, record) => {
					return (
						<Button type='link' onClick={() => this.showDelConfirm(record.id)}>删除</Button>
						// <IconFont type="iconfont-htmal5icon17" className={`text-grey h0`}
						//           onClick={() => this.showDelConfirm(record.id)}/>
					)
				}
			}],
			rowSelection: {
				onChange: this.onSelectChange,
			}
		}
	}

	componentDidMount() {
		this.getOftenShopList();
	}

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		this.setState({
			curPage: page - 1
		}, () => {
			this.getOftenShopList();
		});
	};

	/**
	 * 常购材料
	 * */
	getOftenShopList() {
		regularPurchaseFun(this.state.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					oftenShopList: res.data.resultList,
					total: res.data.totalCount
				})
			}
		})
	}

	onSelectChange = (selectedRowKeys, selections) => {
		this.setState({
			curMulMaterialIds: selectedRowKeys,
			exportList: selections
		});
	};

	/**
	 * 删除材料确认框
	 **/
	showDelConfirm(id) {
		let remainingItem = this.state.total - 1 <= 0 ? 0 : this.state.total - 1;//删除后剩余的列表数量
		if ((remainingItem / this.state.defaultPageSize) <= this.state.curPage) {
			this.setState({
				curPage: this.state.total - 1 <= 0 ? 0 : this.state.total - 1
			}, () => {
				this.setState({
					isShowDelConfirm: true,
					curMaterialId: id
				})
			})
		} else {
			this.setState({
				isShowDelConfirm: true,
				curMaterialId: id
			})
		}
	}

	/**
	 * 批量删除材料确认框
	 **/
	showMulDelConfirm = () => {
		//需要计算剩下的材料数量是否大于当前的页数，如果下剩的材料分页小于当前的页数，当前页数-1；
		if (this.state.curMulMaterialIds.length > 0) {
			let remainingItem = this.state.total - this.state.curMulMaterialIds.length;//删除后剩余的列表数量
			if ((remainingItem / this.state.defaultPageSize) < this.state.curPage) {
				this.setState({
					curPage: this.state.curPage - 1 <= 0 ? 0 : this.state.curPage - 1
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
			this.setTime('请选择材料');
			// message.error('！');
		}
	};

	/**
	 * 删除常购材料
	 * */
	delOftenShop = () => {
		delMaterialFun(this.state.curMaterialId, this.state.userCode).then(res => {
			if (res.result === 'success') {
				this.setState({
					curMaterialId: '',
					isShowDelConfirm: false
				});
				this.getOftenShopList();
			}
		})
	};

	/**
	 * 批量删除常购材料
	 * */
	delMulOftenShop = () => {
		let params = {
			ids: this.state.curMulMaterialIds,
			userCode: this.state.userCode
		};
		delMulMaterialFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isShowMulDelConfirm: false,
					curMulMaterialIds: [],
				});
				// this.getOftenShopList();
				window.location.reload();
			}
		})
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: false
		})
	};

	/**
	 * 显示对应的提示框
	 * */
	showModalOfType = (type) => {
		this.setState({
			showModalOfType: type
		})
	};

	/**
	 * 关闭添加材料提示框
	 * */
	closeAddMaterial = () => {
		this.setState({
			tipOfAddMaterial: false
		}, () => {
			this.getOftenShopList();
		})
	};

	/**
	 * 导出excel
	 * */
	exportExcel = () => {
		if (!this.state.exportList.length) {
			this.setTime('您没有选择要导出的材料！');
			return false;
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
					'!ref': `A1:D${this.state.exportList.length + 2}`,
					'!cols': [{wpx: 45}, {wpx: 165}, {wpx: 100}, {wpx: 45}],
					'!merges': [{
						s: {c: 0, r: 0},
						e: {c: 3, r: 0}
					}],
					A1: {
						v: '常购清单',
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
						v: '序号',
						t: 's',
						s: {
							border: borderAll
						}
					},
					B2: {
						v: '材料名称',
						t: 's',
						s: {
							border: borderAll
						}
					},
					C2: {
						v: '品牌',
						t: 's',
						s: {
							border: borderAll
						}
					},
					D2: {
						v: '单位',
						t: 's',
						s: {
							border: borderAll
						}
					}
				}
			}
		};

		this.state.exportList.forEach((item, index) => {
			workbook.Sheets.Sheet1[`A${2 + index + 1}`] = {v: index + 1, s: {border: borderAll}, t: 'n',};
			workbook.Sheets.Sheet1[`B${2 + index + 1}`] = {v: item.name, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`C${2 + index + 1}`] = {v: item.brand, s: {border: borderAll}, t: 's',};
			workbook.Sheets.Sheet1[`D${2 + index + 1}`] = {v: item.unit, s: {border: borderAll}, t: 's',};
		});

		const workbookOut = XLSX.write(workbook, {
			bookType: 'xlsx',
			bookSST: false,
			type: 'binary'
		});
		saveAs(new Blob([s2ab(workbookOut)], {
			type: 'application/octet-stream'
		}), '常购清单.xlsx')
	};
	/*----获取被选中的材料信息----*/
	printerMaterial = () => {
		if (!this.state.exportList.length) {
			this.setTime('您没有选择要打印的材料！');
			return false;
		}
		Router.push({pathname: '/account/print/oftenshop', query: {ids: this.state.curMulMaterialIds}})
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
		return (
			<Layout menuIndex={'3'} mainMenuIndex={'home'} title="常购材料">
				<section className="bg-white p3">
					<Row>
						<Col span={12}>
							<Button type="primary"
							        className="bg-primary-linear border-radius"
							        style={{marginRight: '20px'}}
							        onClick={() => {
								        this.setState({tipOfAddMaterial: true})
							        }}>添加材料</Button>
							<Button type="primary" ghost onClick={this.printerMaterial} className="border-radius" style={{marginRight: '20px'}}>打印</Button>
							<Button type="primary" ghost onClick={() => this.exportExcel()} className="border-radius">导出</Button>
						</Col>
						<Col span={12} className="text-right">
							<AddInquiry type={'primary'}
							            text={'去询价'}
							            showModalOfType={this.showModalOfType}
							            class="bg-primary-linear border-radius"
							            urlParams={{type: 3, ids: this.state.curMulMaterialIds}}
							            ids={this.state.curMulMaterialIds}
							/>
						</Col>
					</Row>
					{
						this.state.oftenShopList.length > 0 ?
							<aside>
								<Table
									id="oftenTable"
									ref="oftenTable"
									className="mt2"
									rowSelection={this.state.rowSelection}
									columns={this.state.columns}
									dataSource={this.state.oftenShopList}
									pagination={false}
									rowKey={record => record.id}
								/>
								<Row className="mt2">
									<Col span={6} className="ptb1">
										<a onClick={this.showMulDelConfirm} className="text-primary">批量删除</a>
									</Col>
									<Col span={6} className="ptb1">
										<span className="text-muted">已选{this.state.curMulMaterialIds.length}条</span>
									</Col>
									<Col span={12} className="text-right">
										<Pagination onChange={this.onCurPageChange}
										            defaultPageSize={this.state.defaultPageSize}
										            total={this.state.total}
										            showQuickJumper />
									</Col>
								</Row>
							</aside>
							:
							<aside className="text-center ptb6">
								<div><img src="/static/images/icon-nodata.png" alt="" /></div>
								<h3 className="mt3 text-muted">暂未添加常购材料</h3>
							</aside>
					}
					{/*删除常购清单材料确认框*/}
					<Modal
						visible={this.state.isShowDelConfirm}
						onOk={this.delOftenShop}
						onCancel={() => {
							this.setState({isShowDelConfirm: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">确定删除该材料吗！</h2>
					</Modal>
					{/*批量删除常购清单材料确认框*/}
					<Modal
						visible={this.state.isShowMulDelConfirm}
						onOk={this.delMulOftenShop}
						onCancel={() => {
							this.setState({isShowMulDelConfirm: false})
						}}
						okText=" 确认"
						cancelText=" 取消"
					>
						<h2 className="text-center ptb4 mt4">确定删除这些材料吗！</h2>
					</Modal>
					{/*添加材料*/}
					<AddMaterialForMyInquiry show={this.state.tipOfAddMaterial} materialUnit={this.state.units}
					                         close={this.closeAddMaterial} />
					{/*在线客服意见反馈*/}
					{/*<FixedTool/>*/}
				</section>
			</Layout>
		)
	}
}
