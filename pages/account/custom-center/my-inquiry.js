import React from 'react'
import Layout from 'components/Layout/account'
import {Button, DatePicker, Icon, Input, Select, Table, Pagination} from 'antd';
import AddInquiry from 'components/AddInquiry/'
import {iconUrl} from 'config/evn'
import {queryMyInquiryListFun, timestampToTime, userCodeFun} from 'server'
import cookie from 'react-cookies';
import Link from 'next/link';
import Router, {withRouter} from 'next/router';
import './style.less'
// import FixedTool from 'component/FixedTool/'

const {RangePicker} = DatePicker;
const Option = Select.Option;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class MyInquiry extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest',
			inquiryList: [],
			isShowDelConfirm: false,
			title: '',
			status: '',//询价单状态 0：比价中；1：已采购；2：已取消
			start: 0,//起始页
			startTime: '',//开始时间
			endTime: '',//结束时间
			isEnable: '',
			total: 0,
			pagination: {
				defaultPageSize: 16,
				showQuickJumper: true,
				onChange: this.onCurPageChange,
			},
			current: 1,
			isManager: '',//1管理员
			activeKey: '1',
		};
		this.columnsManger = [
			{
				title: '询价标题',
				dataIndex: 'title',
				//width:"28%"
			}, {
				title: '创建时间',
				width: '18%',
				render: (text, record) => {
					return (
						<span className="text-grey">{timestampToTime(record.createTime)}</span>
					);
				}
			}, {
				title: '有效期',
				width: '18%',
				render: (text, record) => {
					return (
						<span
							className="text-grey">{record.validityTime < (new Date()).getTime() ? '超出报价截止日期' : timestampToTime(record.validityTime)}</span>
					);
				}
			}, {
				title: '供应商报价数',
				align: 'center',
				width: '14%',
				render: (text, record) => {
					{/*<i className="text-grey">{record.successCount}/{record.totalCount}</i>*/
					}
					return (
						<i className="text-grey">{record.successCount}</i>
					);
				}
			}, {
				title: '询价单状态',
				dataIndex: 'status',
				width: '12%',
				render: (text, record) => {
					let result = 0, className = '';
					switch (record.status) {
						case 0:
							result = '比价中';
							className = 'active';
							break;
						case 1:
							result = '已采购';
							className = 'over';
							break;
						case 2:
							result = '已取消';
							className = 'cancel';
							break;
					}
					return (
						<i className={`inquiry-flag ${className}`}>{result}</i>
					);
				}
			}, {
				title: '操作',
				align: 'center',
				width: '8%',
				render: (text, record) => {
					return (
						<Link href={{pathname: '/myinquirydetail', query: {id: record.inquirySheetId}}}>
							<a><IconFont type="iconfont-chakan" className="h0 icon-operation-check" /></a>
						</Link>
					)
				}
			}
		];
		this.columns = [
			{
				title: '询价标题',
				dataIndex: 'title',
				width: '28%',
			}, {
				title: '创建时间',
				width: '18%',
				render: (text, record) => {
					return (
						<span className="text-grey">{timestampToTime(record.createTime)}</span>
					);
				}
			}, {
				title: '有效期',
				width: '18%',
				render: (text, record) => {
					return (
						<span
							className="text-grey">{record.validityTime < (new Date()).getTime() ? '超出报价截止日期' : timestampToTime(record.validityTime)}</span>
					);
				}
			}, {
				title: '供应商报价数',
				align: 'center',
				width: '14%',
				render: (text, record) => {
					// /{record.totalCount}
					return (
						<i className="text-grey">{record.successCount}</i>
					);
				}
			}, {
				title: '询价单状态',
				dataIndex: 'status',
				width: '12%',
				render: (text, record) => {
					let result = 0, className = '';
					switch (record.status) {
						case 0:
							result = '比价中';
							className = 'active';
							break;
						case 1:
							result = '已采购';
							className = 'over';
							break;
						case 2:
							result = '已取消';
							className = 'cancel';
							break;
					}
					return (
						<i className={`inquiry-flag ${className}`}>{result}</i>
					);
				}
			}, {
				title: '操作',
				align: 'center',
				width: '10%',
				render: (text, record) => {
					return (
						<Link href={{pathname: '/account/custom-center/my-inquiry-detail', query: {id: record.inquirySheetId}}}>
							<a>查看详情</a>
							{/*<a><IconFont type="iconfont-chakan" className="h0 icon-operation-check" /></a>*/}
						</Link>
					);
				}
			}
		];
	}

	componentDidMount() {
		this.queryMyInquiryList();
		this.getUserInfo();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.router.query.status !== this.props.router.query.status) {
			this.queryMyInquiryList();
		}
	}

	queryMyInquiryList = () => {
		let params = {
			userCode: this.state.userCode,
			status: this.props.router.query.status,
			start: this.state.start,
			title: this.state.title,
			startTime: this.state.startTime,
			endTime: this.state.endTime,
			isEnable: this.state.isEnable
		};
		queryMyInquiryListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					inquiryList: res.data.list,
					total: res.data.count
				})
			}
		})
	};

	/**
	 * 表格页码变化时的回调
	 **/
	onCurPageChange = (page, pageSize) => {
		window.scrollTo(0, 0);
		this.setState({
			start: page - 1,
			current: page,
		}, () => {
			this.queryMyInquiryList();
		});
	};

	/**
	 * 改变询价单状态
	 * 全部传""/比价中 0/已采购 1/已取消 2
	 **/
	changeInquiryStatus = (curStatus) => {
		Router.push({pathname: '/account/custom-center/my-inquiry', query: {status: curStatus}})
		// this.setState({
		// 	status: curStatus,
		// 	start: 0,
		// 	current: 1
		// }, () => {
		// 	this.queryMyInquiryList();
		// })
	};

	/**
	 * 改变查询时间
	 **/
	timeChange = (date, dateString) => {
		this.setState({
			startTime: dateString[0],
			endTime: dateString[1]
		})
	};

	/**
	 * 改变询价单是否过期
	 **/
	statusChange = (value, options) => {
		this.setState({
			isEnable: value,
		})
	};

	/**
	 * 搜索标题
	 **/
	titleChange = (e) => {
		this.setState({
			title: e.target.value
		})
	};

	closeChildModal = () => {
		this.setState({
			showModalOfType: 0
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
	/*---判断是否是管理员--*/
	getUserInfo = () => {
		let params = {
			userCode: this.state.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isManager: res.data.isManager
				})
			}
		})
	};
	/*----卡片----*/
	changeCard = (key) => {
		this.setState({
			activeKey: key
		})

	};

	render() {
		const {router} = this.props;
		return (
			<Layout title="我的询价单" menuIndex={'4'} mainMenuIndex={'home'}>
				<section className="bg-white">
					<div className="my-inquiry-tab">
						<Button type="link" size='large' onClick={() => this.changeInquiryStatus('')}
						        className={router.query.status === '' ? 'active' : 'text-muted'}>全部
						</Button>
						<Button type="link" size='large' onClick={() => this.changeInquiryStatus('0')}
						        className={router.query.status === '0' ? 'active' : 'text-muted'}>比价中</Button>
						<Button type="link" size='large' onClick={() => this.changeInquiryStatus('1')}
						        className={router.query.status === '1' ? 'active' : 'text-muted'}>已采购</Button>
						<Button type="link" size='large' onClick={() => this.changeInquiryStatus('2')}
						        className={router.query.status === '2' ? 'active' : 'text-muted'}>已取消</Button>
					</div>
					<aside className="p3">
						<AddInquiry type={'primary'} text={'去询价'} class='bg-primary-linear border-radius' showModalOfType={this.showModalOfType} />
						<div className="mt2">
							<label style={{marginRight: '10px'}}>创建时间</label>
							<RangePicker style={{width: '240px'}} size="default" onChange={this.timeChange} />
							<span style={{marginLeft: '30px', marginRight: '10px'}}>询价状态</span>
							<Select style={{width: '120px'}} defaultValue="全部状态" onChange={this.statusChange}>
								<Option value="">全部状态</Option>
								<Option value="0">已过期</Option>
								<Option value="1">未过期</Option>
							</Select>
							<label style={{marginLeft: '46px', marginRight: '10px'}}>查询</label>
							<Input style={{width: '160px'}} size="default" placeholder="请输入询价单标题" onChange={this.titleChange} />
							<Button type="primary" className='bg-primary-linear border-radius' style={{marginLeft: '54px', width: '100px'}}
							        onClick={this.queryMyInquiryList}>查询</Button>
						</div>
						<div>
							<Table ref="table"
							       hideDefaultSelections={true}
							       className="mt2 text-muted"
							       rowKey={record => record.inquirySheetId}
							       columns={this.columns}
							       pagination={false}
							       dataSource={this.state.inquiryList}
							/>
							<div className="mt3 text-right">
								<Pagination {...this.state.pagination} total={this.state.total}
								            current={this.state.current} />,
							</div>
						</div>
					</aside>
				</section>
			</Layout>
		)
	}
}

export default withRouter(MyInquiry)
