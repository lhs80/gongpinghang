import React, {Component, Fragment} from 'react';
import {Row, Col, Button, Modal, Badge, Empty} from 'antd'
import AddBillAddress from './AddBillAddress'
import EditBillAddress from './EditBillAddress'
import '../style.less'
import cookie from 'react-cookies';
import {deleteAddressFun, setDefaultFun, userAddressFun} from '../../../../server';

class Index extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showAddForm: false,//显示新增地址窗口
			showEditAddress: false,//显示编辑地址窗口
			editAddressInfo: {},//要编辑的地址内容
		}
	}

	close = () => {
		this.setState({
			showAddForm: false,
			showEditAddress: false,
		});
		this.props.getBillAddress();
	};

	/*-----删除收货地址-----*/
	delAddress = (id) => {
		Modal.confirm({
			width: '300px',
			title: '提示',
			cancelText: '取消',
			okText: '确认删除',
			content: <div>确认删除该地址</div>,
			onOk: () => {
				deleteAddressFun(id).then(res => {
					if (res.result === 'success') {
						this.props.getBillAddress();
						this.setState({
							isExpand: false
						})
					}
				})
			}
		});
	};

	todoEditAddress = (item) => {
		this.setState({
			showEditAddress: true,
			editAddressInfo: item
		})
	};

	//子组件调取用户选择的收货地址信息
	queryReceiveAddress = () => {
		//筛选出用户选择的地址
		let receiveAddr = this.props.receiveAddress.filter(item => {
			return item.id === this.props.receiveAddrId
		});
		return receiveAddr[0]
	};

	/*----设置默认地址-----*/
	setDefault = (id) => {
		let userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		setDefaultFun(userCode, id).then(res => {
			if (res.result === 'success') {
				this.props.getBillAddress();
				this.setState({
					isExpand: false
				})
			}
		})
	};

	render() {
		const {showAddForm} = this.state;
		const {billAddress, invoiceDeliveryId} = this.props;
		return (
			<Fragment>
				<Row className="prl3 mt3">
					<Col span={12}>收票地址：</Col>
					<Col span={12} className="text-right">
						<Button type="link"
						        icon="plus"
						        onClick={() => this.setState({
							        showAddForm: true
						        })}
						>
							<span style={{verticalAlign: 'middle'}}>添加发票地址</span>
						</Button>
					</Col>
				</Row>
				{
					billAddress.length ?
						billAddress.map((item, index) => {
							return <Row
								className={`bill-address-item ${item.id === invoiceDeliveryId ? 'active' : ''}`}
								key={index}
								onClick={() => this.props.onBillAddressChange(item.id)}
							>
								<Col span={19}>
									<span style={{verticalAlign: 'middle'}}>{item.userName}</span>
									<span style={{verticalAlign: 'middle'}} className="prl1">{item.userPhone}</span>
									<span className="text-muted text-ellipsis"
									      style={{
										      maxWidth: '450px',
										      display: 'inline-block',
										      verticalAlign: 'middle'
									      }}>{item.province} {item.city} {item.area} {item.address}
								</span>
									<span className="text-muted prl1" style={{verticalAlign: 'middle'}}>{item.email}</span>
									{item.isDefault === '1' ?
										<Badge style={{backgroundColor: '#D9ECFF', color: '#409EFF', verticalAlign: 'middle'}} count={'默认'} />
										:
										''
									}
								</Col>
								<Col span={5} className="text-right">
									{
										item.isDefault === '1' ?
											null
											:
											<Button type="link" onClick={() => this.setDefault(item.id)}>设置默认地址</Button>
									}
									<Button size="small" type="link" onClick={() => this.todoEditAddress(item)}>修改</Button>
									<Button size="small" type="link" onClick={() => {
										this.delAddress(item.id)
									}}>删除</Button>
								</Col>
							</Row>
						})
						:
						<Empty description="暂无收票地址" className="mt2" />
				}
				<AddBillAddress show={showAddForm} close={this.close} queryReceiveAddress={this.queryReceiveAddress} />
				<EditBillAddress show={this.state.showEditAddress}
				                 close={this.close}
				                 addressInfo={this.state.editAddressInfo}
				                 queryReceiveAddress={this.queryReceiveAddress}
				/>
			</Fragment>
		);
	}
}

export default Index
