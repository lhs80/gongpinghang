import React, {Component, Fragment} from 'react';
import {Button, Divider, Row, Col, Modal} from 'antd';
import CommonAdd from './common/Add';
import CommonList from './common/List';
import TaxAdd from './tax/Add';
import TaxList from './tax/List';

class Index extends Component {
	constructor(props) {
		super(props);
		this.state = {
			selBillinfo: {},//用户选择的发票信息
			showBillDialog: false,
			billType: 0,//0:不开发票；1：普通发票；2、增值税发票
			isAddTaxBill: false,//false:显示列表；true：显示新增
			isAddCommonBill: false,//false:显示列表；true：显示新增
		}
	}

	//选择发票类型并关闭窗口
	changeBillType = (type) => {
		this.setState({
			billType: type,
			isAddTaxBill: false,
			isAddCommonBill: false
		})
	};

	showAddCommonDialog = () => {
		this.setState({
			isAddCommonBill: true
		})
	};

	showAddTaxDialog = () => {
		this.setState({
			isAddTaxBill: true
		})
	};

	close = () => {
		this.setState({
			showBillDialog: false,
			billType: 0,//0:不开发票；1：普通发票；2、增值税发票
			isAddTaxBill: false,//false:显示列表；true：显示新增
			isAddCommonBill: false//false:显示列表；true：显示新增
		});
	};

	addClose = () => {
		this.setState({
			isAddTaxBill: false,//false:显示列表；true：显示新增
			isAddCommonBill: false//false:显示列表；true：显示新增
		});
	};

	openDialog = () => {
		this.setState({
			showBillDialog: true
		})
	};

	//向父组件传递子组件传回来的发票信息
	submit = (item) => {
		this.props.submit(item);
		this.setState({
			showBillDialog: false,
			selBillinfo: item
		})
	};

	render() {
		const {showBillDialog, billType, isAddTaxBill, isAddCommonBill, selBillinfo} = this.state;
		const TaxCommonContent = isAddCommonBill ?
			<CommonAdd close={this.addClose} />
			:
			<CommonList showAddCommonDialog={this.showAddCommonDialog} close={this.close} submit={(item) => this.submit(item)} />;
		const TaxBillContent = isAddTaxBill ?
			<TaxAdd close={this.addClose} />
			:
			<TaxList showAddTaxDialog={this.showAddTaxDialog} close={this.close} submit={(item) => this.submit(item)} />;

		return (
			<Fragment>
				<div className="common-title">
					<Divider type="vertical" className="line" />
					发票信息
				</div>
				<div className="prl3">
					<label>发票类型：{selBillinfo.type}</label>
					<span>
						{
							selBillinfo.id > 0 ?
								selBillinfo.invoiceType ? '增值税发票' : '普通发票'
								:
								'不开发票'
						}
					</span>
					<Button type="link" onClick={this.openDialog}>请选择</Button>
				</div>
				<div className="prl3">
					<label style={{verticalAlign: 'middle'}}>发票抬头：</label>
					{
						selBillinfo.id > 0 ?
							<Fragment>
								{
									selBillinfo.titleType === 0 ?
										<Row style={{display: 'inline-block', verticalAlign: 'middle', width: '600px'}}>
											<Col span={12}><span className="title">[个人抬头]</span><span className="prl1 text-grey">{selBillinfo.titleDesc}</span></Col>
										</Row>
										:
										<Row style={{display: 'inline-block', verticalAlign: 'middle', width: '600px'}}>
											<Col span={12}><span className="title">[企业抬头]</span><span className="prl1 text-grey">{selBillinfo.titleDesc}</span></Col>
											<Col span={12}><span className="title">[税号]</span><span className="prl1 text-grey">{selBillinfo.creditCode}</span></Col>
										</Row>
								}
							</Fragment>
							:
							'(您选择了不开票)'
					}
				</div>
				<Modal
					width={700}
					title="发票"
					centered
					visible={showBillDialog}
					onOk={() => this.close}
					onCancel={() => this.close}
					closable={false}
					footer={null}
					bodyStyle={{height: '500px', background: 'white'}}
				>
					<ul className="bill-btn">
						<li className={billType === 0 ? 'active' : ''} onClick={() => this.changeBillType(0)}>不开发票</li>
						<li className={billType === 1 ? 'active' : ''} onClick={() => this.changeBillType(1)}>普通发票</li>
						<li className={billType === 2 ? 'active' : ''} onClick={() => this.changeBillType(2)}>增值税发票</li>
					</ul>
					{
						billType === 1 ?
							<div>
								{TaxCommonContent}
							</div>
							:
							null
					}
					{
						billType === 2 ?
							<div>
								{TaxBillContent}
							</div>
							:
							null
					}
					{
						billType === 0 ?
							<div className="bill-dialog-footer">
								<Button type="primary" onClick={()=>this.submit({})}>确定</Button>
								<Button onClick={()=>this.submit({})}>取消</Button>
							</div>
							:
							null
					}
				</Modal>
			</Fragment>
		);
	}
}

export default Index;
