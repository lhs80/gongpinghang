import React, {Component} from 'react';
import {Button, Col, Row} from 'antd';
import {billListFun} from '../../../../../server/newApi';
import cookie from 'react-cookies';

class List extends Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			selectBill: {},
			list: []
		}
	}

	componentDidMount() {
		this.queryBillList();
	}

	queryBillList = () => {
		let params = {
			userCode: this.userCode,
			type: 1
		};
		billListFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					list: res.data
				})
			}
		})
	};

	changeSelectId = (item) => {
		this.setState({
			selectBill: item
		})
	};

	//向父组件提交选择的数据
	submit = () => {
		this.props.submit(this.state.selectBill)
	};

	render() {
		const {selectBill, list} = this.state;
		return (
			<div className="mt2">
				<Button icon="plus" type="link" onClick={this.props.showAddTaxDialog}>
					<span style={{verticalAlign: 'middle'}}>新增增值税发票</span>
				</Button>
				<ul className="bill-list">
					{
						list.map((item, index) => {
							return <li className={`${item.id === selectBill.id ? 'active' : ''}`}
							           key={index}
							           onClick={() => this.changeSelectId(item)}
							>
								<Row>
									<Col span={12}><span className="title">[企业抬头]</span><span className="text-grey">{item.titleDesc}</span></Col>
									<Col span={12}><span className="title">[税   号]</span><span className="text-grey">{item.creditCode}</span></Col>
								</Row>
								<Row>
									<Col span={12}><span className="title">[注册地址]</span><span className="text-grey">{item.registeredAddress}</span></Col>
									<Col span={12}><span className="title">[开户银行]</span><span className="text-grey">{item.depositBank}</span></Col>
								</Row>
								<Row>
									<Col span={12}><span className="title">[银行账号]</span><span className="text-grey">{item.bankAccount}</span></Col>
									<Col span={12}><span className="title">[电话号码]</span><span className="text-grey">{item.mobile}</span></Col>
								</Row>
							</li>
						})
					}
				</ul>
				<div className="bill-dialog-footer">
					<Button type="primary" onClick={this.submit}>确定</Button>
					<Button onClick={this.props.close}>取消</Button>
				</div>
			</div>
		);
	}
}

export default List
