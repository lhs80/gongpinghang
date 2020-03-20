import React, {Component} from 'react';
import {Button, Row, Col} from 'antd';
import {billListFun} from '../../../../../server/newApi';
import '../../style.less'
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
			type: 0
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

	//提交选择的数据
	submit = () => {
		this.props.submit(this.state.selectBill)
	};

	render() {
		const {selectBill, list} = this.state;
		return (
			<div className="mt2">
				<Button icon="plus" type="link" onClick={this.props.showAddCommonDialog}>
					<span style={{verticalAlign: 'middle'}}>新增普通发票</span>
				</Button>
				<ul className="bill-list">
					{
						list.map((item, index) => {
							return <li className={`${item.id === selectBill.id ? 'active' : ''}`}
							           key={index}
							           onClick={() => this.changeSelectId(item)}
							>
								{
									item.titleType === 0 ?
										<Row>
											<Col span={12}><span className="title">[个人抬头]</span><span className="prl1 text-grey">{item.titleDesc}</span></Col>
										</Row>
										:
										<Row>
											<Col span={12}><span className="title">[企业抬头]</span><span className="prl1 text-grey">{item.titleDesc}</span></Col>
											<Col span={12}><span className="title">[税号]</span><span className="prl1 text-grey">{item.creditCode}</span></Col>
										</Row>
								}
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
