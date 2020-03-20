//新增收货地址
import React from 'react'
import Layout from 'components/Layout/setting'
import {Form, Select} from 'antd';
import Address from 'components/address'
import './style.less'


class AddAddressForm extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<Layout title="新增收货地址" menuIndex={'8'} mainMenuIndex={'setting'}>
				<section className="bg-white p4 addAddress" style={{height: '766px'}}>
					<p className="h0 mt2 addTitle prl2 text-grey" style={{marginLeft: '64px'}}>新增收货地址</p>
					<div className="mt4" style={{width: '440px', margin: '0 auto'}}>
						<Address history={this.props.history} type="1" />
					</div>
				</section>
			</Layout>
		)
	}
}

const AddAddress = Form.create()(AddAddressForm);
export default AddAddress
