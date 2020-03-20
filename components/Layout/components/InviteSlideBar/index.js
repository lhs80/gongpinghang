import React from 'react'
import Link from 'next/link'
import {Icon, Layout, Menu, Modal} from 'antd';
import './style.less'
import cookie from 'react-cookies';
import {iconUrl} from '../../../../config/evn';

const {Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
export default class SlideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			userCode: cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode ? cookie.load('ZjsWeb').userCode : null : null,
		};
	}

	componentDidMount() {

	}

	render() {
		return (
			<Sider className="userInfo-slider">
				<h4 className="setting-home">
					<span style={{color: '#3b465f'}}>
						<IconFont type={'iconfont-zhaobiao'} style={{color: '#929fad', marginRight: '19px'}}/>
						{/*<Icon type="setting" theme="filled" style={{color: '#929fad', marginRight: '19px'}} />*/}
						我的招投标</span>
				</h4>
				<Menu defaultSelectedKeys={[this.props.menuIndex]} mode="inline">
					<Menu.Item key="1">
						<Link href={"/invite/mine"}>
                            <a>
                                <h4 className="text-black ptb2">我的招标</h4>
							</a>
						</Link>
					</Menu.Item>
					<Menu.Item key="2">
                        <Link href={"/invite/mine/tender"}>
                            <a>
                                <h4 className="text-black ptb2">我的投标</h4>
							</a>

                        </Link>
					</Menu.Item>
				</Menu>
			</Sider>
		)
	}
}
