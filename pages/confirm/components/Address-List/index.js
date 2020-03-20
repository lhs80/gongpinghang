import React, {Component, Fragment} from 'react';
import {Badge, Button, Col, Divider, Icon, Modal, Row, Empty} from 'antd';
import AddAddress from './AddAddress';
import EditAddress from './EditAddress';
import {deleteAddressFun, setDefaultFun, userAddressFun} from '../../../../server/index';
import cookie from 'react-cookies';
import {iconUrl} from '../../../../config/evn';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class AddressList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isExpand: false,//是否展开地址
			showEditAddress: false,//显示编辑地址窗口
			editAddressInfo: {},//要编辑的地址内容
		};
	}

	todoEditAddress = (item) => {
		this.setState({
			showEditAddress: true,
			editAddressInfo: item
		})
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
						this.props.getReceiveAddress();
						this.setState({
							isExpand: false
						})
					}
				})
			}
		});
	};

	/*----设置默认地址-----*/
	setDefault = (id) => {
		let userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		setDefaultFun(userCode, id).then(res => {
			if (res.result === 'success') {
				this.props.getReceiveAddress();
				this.props.onAddressChange(id)
				this.setState({
					isExpand: false
				})
			}
		})
	};

	close = () => {
		this.setState({
			showAddress: false,
			showEditAddress: false
		});
		this.props.getReceiveAddress();
	};

	render() {
		const {isExpand} = this.state;
		const {addressList, deliveryId} = this.props;
		return (
			<Fragment>
				<Row className="common-title">
					<Col span={12}>
						<Divider type="vertical" className="line" />
						收货信息
					</Col>
					<Col span={12} className="text-right">
						<Button type="link"
						        icon="plus"
						        onClick={() => {
							        this.setState({
								        showAddress: true
							        })
						        }}>
							<span style={{verticalAlign: 'middle'}}>新建地址</span>
						</Button>
					</Col>
				</Row>
				<div className={`address-list ${isExpand ? 'spread' : 'expand'}`}>
					{
						addressList.length ?
							addressList.map((item, index) => {
								return (
									<div className={`address-list-item ${item.id === deliveryId ? 'active' : ''}`}
									     key={index}
									     onClick={() => this.props.onAddressChange(item.id)}
									>
										<Row type="flex" align="middle">
											<Col span={14}>
												<span style={{marginRight: '4px', verticalAlign: 'middle'}}>{item.userName}</span>
												{item.isDefault === '1' ?
													<Badge style={{backgroundColor: '#D9ECFF', color: '#409EFF', verticalAlign: 'middle'}} count={'默认'} />
													:
													''
												}
											</Col>
											<Col span={10} className='text-right'>
												<span className='btn' onClick={() => this.todoEditAddress(item)}>修改</span>
												<span className="btn" onClick={() => {
													this.delAddress(item.id)
												}}>删除</span>
											</Col>
										</Row>
										<Divider style={{margin: '15px 0'}} />
										<div className="text-grey">
											<span>{item.userName}</span>
											<span className="prl1">{item.userPhone}</span>
										</div>
										<div className='mt1'>
											<span>{item.province}</span>
											<span className='prl1'>{item.city}</span>
											<span>{item.area}</span>
										</div>
										<div className="text-ellipsis">{item.address}</div>
										{item.isDefault === '1' ?
											''
											:
											<a className="btn text-muted" onClick={() => this.setDefault(item.id)}>设置默认</a>
										}
									</div>
								)
							})
							:
							<Empty description="暂无收货地址" className="mt2" />
					}
				</div>
				{
					addressList.length > 4 ?
						<div className="text-muted prl2" onClick={() => {
							this.setState({
								isExpand: !isExpand
							})
						}}>
							更多地址
							<IconFont type="iconfont-xiajiantou" />
						</div>
						:
						''
				}
				{/*---选择收货地址----*/}
				<AddAddress show={this.state.showAddress} close={this.close} />
				<EditAddress show={this.state.showEditAddress}
				             close={this.close}
				             addressInfo={this.state.editAddressInfo}
				/>
			</Fragment>
		);
	}
}

export default AddressList
