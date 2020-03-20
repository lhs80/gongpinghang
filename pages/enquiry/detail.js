// 用户中心
import React from 'react'
import Layout from 'components/Layout/index'
import Router, {withRouter} from 'next/router'
import {Button, Icon, Table, Row, Col, Modal, Statistic} from 'antd';
import {iconUrl, baseUrl, businessUrl} from 'config/evn'
import {queryInquiryHallDetail, timestampToTime, cancelInquiryFun, userCodeFun} from 'server'
import './style.less'
import moment from 'moment'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
const {Countdown} = Statistic;

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
			title: '品名',
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
			align: 'center',
			render: (record) => <div>{record.remark ? record.remark : '--'}</div>
		}];

		this.shopColumns = [{
			title: '公司名称',
			dataIndex: 'shopName',
			align: 'center'
		}, {
			title: '所在地区',
			align: 'center',
			render: (text, record) => {
				return <div>{record.province}{record.city}</div>
			}
		}, {
			title: '报价时间',
			render: (text, record) => {
				return (
					timestampToTime(record.quoteTime)
				);
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
			inquirySheetId: this.props.router.query.id
		};
		queryInquiryHallDetail(params).then(res => {
			if (res.result === 'success') {
				let now = new Date().getTime();
				// let diffDate = (res.data.validityTime - now);
				this.setState({
					inquiryInfo: res.data,
					// discountDay: Math.floor(diffDate / (24 * 60 * 60 * 1000))
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

	computedQuoteRequirement() {
		switch (this.state.inquiryInfo && this.state.inquiryInfo.quoteRequirement) {
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
		const {inquiryInfo} = this.state;
		return (
			<Layout menuIndex={'inquiry'} title="询价单详情">
				<section className="page-content mt2" style={{position: 'relative'}}>
					<div className="bg-white prl3 ptb4">
						<div className="inquiry-main-title">{inquiryInfo ? inquiryInfo.title : ''}</div>
						<div className="text-darkgrey mt2 prl3 ptb1" style={{background:'#FFFAF0'}}>
							<span>
								<i className="text-muted">询价单编号：</i>
								<i className="text-black">{inquiryInfo ? inquiryInfo.inquiryCode : ''}</i>
							</span>
							<span style={{margin: '0 132px'}}>
								<i className="text-muted">发布时间：</i>
								<i className="text-black">{moment(inquiryInfo ? inquiryInfo.createTime : '').format('YYYY-MM-DD HH:mm:ss')}</i>
							</span>
							<span>
								<i className="text-muted">采购身份：</i>
								<i className="text-black">
									{inquiryInfo ? inquiryInfo.buyerIdentity : ''}
									{
										(() => {
											switch (inquiryInfo && inquiryInfo.isAuthUser) {
												case 0:
													return <span className="text-primary"> (未认证)</span>;
												case 1:
													return <span className="text-primary"> (审核中)</span>;
												case 2:
													return <span className="text-primary"> (已认证)</span>;
												case 3:
													return <span className="text-primary"> (认证失败)</span>;
											}
										})()
									}
							  </i>
							</span>
						</div>
					</div>
					<div className="bg-white mt2 p3">
						<div className="inquiry-detail-sub-title mt3">采购商品</div>
						<Table ref="table"
						       className="inquiry-detail-table-inquiry mt3"
						       pagination={false}
						       rowKey={record => record.materialInquiryId}
						       rowSelection={this.rowSelection}
						       columns={this.materialColumns}
						       dataSource={inquiryInfo ? inquiryInfo.inquirySheetMaterials : ''} />
						<div className="inquiry-detail-sub-title mt3">附件图片</div>
						<div className="att-image mt2 inquiry-detail-sub-content">
							{(() => {
								if (this.state.inquiryInfo && this.state.inquiryInfo.image) {
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
						<div className="inquiry-detail-sub-title mt3">买家要求</div>
						<div className="inquiry-detail-sub-content">
							<div><label>报价要求：</label><span>{this.computedQuoteRequirement()}</span></div>
							<div><label>截止报价：</label><span>{inquiryInfo ? moment(inquiryInfo.validityTime).format('YYYY-MM-DD HH:mm:ss') : ''}</span></div>
							<div><label>收货地区：</label><span>{inquiryInfo ? inquiryInfo.consigneeProvince : ''}-{inquiryInfo ? inquiryInfo.consigneeCity : ''}</span>
							</div>
							<div>
								<span className="text-darkgrey">
									<i className="text-muted ">买家备注：</i>
									<i style={{wordWrap: 'break-word'}}>{inquiryInfo && inquiryInfo.buyerNote || '无'}</i>
								</span>
							</div>
						</div>
						<div className="inquiry-detail-sub-title mt3">已收到的报价</div>
						<Table ref="table"
						       pagination={false}
						       className="inquiry-detail-table-inquiry mt2"
						       rowKey={record => record.shopId}
						       rowSelection={this.rowSelection}
						       columns={this.shopColumns}
						       style={{marginBottom: '80px'}}
						       dataSource={inquiryInfo ? inquiryInfo.inquirySheetShops : ''} />
						<div className="text-center text-white flex-menu">
							<span className="text-muted">距离报价结束还剩：</span>
							<Countdown value={inquiryInfo ? inquiryInfo.validityTime : ''}
							           format={Math.abs(moment().diff(inquiryInfo && inquiryInfo.validityTime, 'days')) >= 1 ? 'D 天 H 时 m 分 s 秒' : 'HH:mm:ss'}
							           valueStyle={{color: '#FFB432', fontSize: '20px'}} className="timer" />
							<a className="ant-btn ant-btn-lg bg-primary-linear border-radius"
							   href={`${businessUrl}/inquirymanage/filloffer?inquirySheetId=${inquiryInfo ? inquiryInfo.inquirySheetId : ''}`}
							   target="_blank">
								<IconFont type='iconfont-fasong' /> 我要报价
							</a>
						</div>
						{/* 右上角询价单状态 */}
						<div className='mall-inquiry-detail-flag'>
							<div className='h6'>已报价数目</div>
							<div className='h3'>{inquiryInfo ? inquiryInfo.quoteCount : 0}
								<small>家</small>
							</div>
						</div>
					</div>

					{/*显示附件大图*/}
					<Modal visible={this.state.previewVisible} footer={null} onCancel={() => {
						this.setState({previewVisible: false})
					}}>
						<img alt="example" style={{width: '100%'}} src={this.state.previewImage} />
					</Modal>
				</section>
			</Layout>
		)
	}
}

export default withRouter(MyInquiryDetail)
