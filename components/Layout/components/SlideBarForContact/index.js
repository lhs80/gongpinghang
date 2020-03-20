import React from 'react'
import Link from 'next/link'
import {Icon, Layout, Menu} from 'antd';
import {iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import {questionListTypeFun} from 'server';
import './style.less'

const {Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});
export default class SlideBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			questionTypeList: [],
		}
	}

	componentDidMount() {
		this.getQuestionList();
	}

	getQuestionList() {
		questionListTypeFun().then(res => {
			if (res.result === 'success') {
				this.setState({
					questionTypeList: res.data
				})
			}
		})
	}

	render() {
		return (
			<Sider className="userInfo-slider" style={{background: 'white', marginRight: '20px'}}>
				<h4 className="p3">
                  <span style={{color: '#3b465f'}}>
                    <IconFont type="iconfont-yijianfankui" className="text-muted h1" style={{verticalAlign: 'middle'}} />
                    <span className="prl1">帮助中心</span>
                  </span>
				</h4>
				<Menu mode="inline" defaultSelectedKeys={['3']}>
					<Menu.Item key="3"><span className="h4" style={{height: '90px'}}>联系方式</span></Menu.Item>
				</Menu>
			</Sider>
		)
	}
}
