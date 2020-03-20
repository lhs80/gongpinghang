import React from 'react'
import Link from 'next/link'
import {Icon, Layout, Menu} from 'antd';
import {iconUrl} from 'config/evn'
import './style.less'

const {Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
export default class SlideBar extends React.Component {
	changeMenu = (type) => {
		this.setState({
			curType: type
		}, () => {
			sessionStorage.setItem('type', type); // 存入一个值
		})
	};

	render() {

		return (
			<Sider className="userInfo-slider">
				<h4 className="setting-home" style={{color: '#3b465f'}}>
					<Icon type="appstore" theme="filled" className="h1" style={{color: '#929fad', marginRight: '16px'}} />个人中心
				</h4>
				<Menu mode="inline" selectedKeys={[this.props.menuIndex]}>
					<Menu.ItemGroup key="g1" style={{marginTop: '20px'}} title={
						<span>
              <IconFont type="iconfont-caigou" className="h1" style={{margin: '0 15px', verticalAlign: 'middle'}} />
              <span className="h4 text-black">我的采购单</span>
            </span>
					}>
						<Menu.Item key="enquiry">
							<Link href={{pathname: '/account/purchase/home', query: {type: 2}}}>
								<div className="h5" style={{paddingLeft: '5px'}}>商城订单</div>
							</Link>
						</Menu.Item>
						<Menu.Item key="sample">
							<Link href={{pathname: '/account/purchase/home', query: {type: 3}}}>
								<div className="h5" style={{paddingLeft: '5px'}}>寄样订单</div>
							</Link>
						</Menu.Item>
					</Menu.ItemGroup>
					<Menu.Item key="2">
						<Link href='/account/cart/home'>
						   <span className="ant-menu-item-customer">
							   <IconFont type="iconfont-fahuo" className="h1" style={{marginRight: '12px', verticalAlign: 'middle'}} />我的购物车
						   </span>
						</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link href='/account/custom-center/often-shop'>
							 <span className="ant-menu-item-customer">
								  <IconFont type="iconfont-caigou1" className="h1" style={{marginRight: '12px', verticalAlign: 'middle'}} />常购材料
						   </span>
						</Link>
					</Menu.Item>
					<Menu.Item key="5">
						<Link href='/account/custom-center/my-collection'>
							 <span className="ant-menu-item-customer">
								 <IconFont type="iconfont-shoucang3" className="h1" style={{marginRight: '12px', verticalAlign: 'middle'}} />我的收藏
						   </span>
						</Link>
					</Menu.Item>
					<Menu.Item key="10">
						<Link href='/account/custom-center/my-feed-back'>
              <span className={`ant-menu-item-customer ${this.props.curType === '1' ? 'active' : ''}`}>
	              <IconFont type="iconfont-yijianfankui" className="h1" style={{marginRight: '12px', verticalAlign: 'middle'}} />意见反馈
              </span>
						</Link>
					</Menu.Item>
				</Menu>

			</Sider>
		)
	}
}
