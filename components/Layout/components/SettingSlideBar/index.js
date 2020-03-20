import React from 'react'
import Link from 'next/link'
import Router from 'next/router'
import {Icon, Layout, Menu, Modal} from 'antd';
import './style.less'
import {userCodeFun} from 'server'
import cookie from 'react-cookies';

const {Sider} = Layout;

export default class SlideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
			isAuthUser: null,
			isAuthCom: '',
			isAuthPri: '',
			/*----企业认证弹窗----*/
			visibleAuther: false,
			personalStatus: false,
			isManager: false
		};
	}

	componentDidMount() {
		this.getUserCode();
	}

	getUserCode = () => {
		let params = {
			userCode: this.state.userCode
		};
		userCodeFun(params).then(res => {
			if (res.result === 'success') {
				this.setState({
					isAuthUser: res.data.isAuthUser,
					isAuthCom: res.data.isAuthCom,
					isAuthPri: res.data.isAuthPri,
					isManager: res.data.isManager //是否企业账户管理员
				})
			}
		})
	};

	/**
	 * 只有企业管理员可以浏览员工账号管理
	 * type=1跳到员工账号管理
	 * type=2跳到银行卡管理
	 * */
	onlyAdminEnter = (type) => {
		if (!this.state.isManager) {
			Modal.warning({
				title: '提示',
				okText: '我知道了',
				content: (
					<div>
						<p>仅完成企业认证的管理员有操作权限</p>
					</div>
				)
			});
		} else {
			switch (type) {
				case 1:
					Router.push('/account/multi-account/employee/list');
					break;
				case 2:
					Router.push('/account/bank-manage/list');
					break;
			}
		}
	};

	render() {
		return (
			<Sider className="userInfo-slider">
				<h4 className="setting-home">
					<span style={{color: '#3b465f'}}><Icon type="setting" theme="filled" style={{color: '#929fad', marginRight: '19px'}} />账户设置</span>
				</h4>
				<Menu defaultSelectedKeys={[this.props.menuIndex]} mode="inline">
					<Menu.Item key="1">
						<Link href="/account/set-user/index">
							<a className="subName">账户资料</a>
						</Link>
					</Menu.Item>
					<Menu.Item key="3">
						<Link href='/account/set-user/change-phone'>
							<a className="prl1">更换手机号</a>
						</Link>
					</Menu.Item>
					<Menu.Item key="4">
						<Link href='/account/set-user/change-passWord'><a className="prl1">更换密码</a></Link>
					</Menu.Item>
					{/*<Menu.Item key="5">*/}
						{/*<Link href={`/account/set-user/companyauther`}>*/}
							{/*<a className="subName">企业管理</a>*/}
						{/*</Link>*/}
					{/*</Menu.Item>*/}
					{/*<Menu.Item key="6"><a onClick={() => this.onlyAdminEnter(1)} className="prl1">员工账号管理</a></Menu.Item>*/}
					{
						this.state.isManager ?
							<Menu.Item key="9"><a onClick={() => this.onlyAdminEnter(2)} className="prl1">银行卡管理</a></Menu.Item>
							:
							null
					}
					<Menu.Item key="7"><Link href='/account/set-user/receiving-address'><a className="subName">收货地址 </a></Link></Menu.Item>
					<Menu.Item key="8"><Link href='/account/set-user/add-address'><a className="prl1">新增收货地址</a></Link></Menu.Item>
				</Menu>

				{/*<Link href="/accountDatum" className={`ant-menu-item-customer ${(this.props.curStyle === '0') ? 'active' : ''}`}>账户资料</Link>*/
				}
				{/*<Menu mode="inline" defaultSelectedKeys={[this.props.menuIndex]} onClick={this.handleClick}>*/
				}
				{/*<Menu.Item key="3" className="secondLevel"><Link to={'/changePhone'}>更换手机号</Link></Menu.Item>*/
				}
				{/*<Menu.Item key="4" className="secondLevel"><Link to={'/changePassWord'}>更换密码</Link></Menu.Item>*/
				}
				{/*</Menu>*/
				}
				{/*<Link href={this.state.isAuthPri ? '/searchAuthCom' : '/company/error'}*/
				}
				{/*className={`ant-menu-item-customer ${(this.props.curStyle === '2') ? 'active' : ''}`}>企业管理</Link>*/
				}
				{/*<h4 className={`ant-menu-item secondLevel ${this.props.menuKey === '6' ? 'ant-menu-item-selected' : ''}`} onClick={this.onlyAdminEnter}>*/
				}
				{/*<a>员工账号管理</a>*/
				}
				{/*</h4>*/
				}
				{/*<Link href='/receivindAddress' className={`ant-menu-item-customer ${(this.props.curStyle === '1') ? 'active' : ''}`}>收货地址</Link>*/
				}
				{/*<Menu mode="inline" defaultSelectedKeys={[this.props.menuIndex]}>*/
				}
				{/*<Menu.Item key="addAddress" className="secondLevel">*/
				}
				{/*<Link href={'/addAddress'}>新增收货地址</Link>*/
				}
				{/*</Menu.Item>*/
				}
				{/*</Menu>*/
				}
			</Sider>
		)
	}
}
