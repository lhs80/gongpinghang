import React from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'
import {Icon, Layout, Menu} from 'antd';
import {iconUrl} from 'config/evn'
import cookie from 'react-cookies';
import {questionListTypeFun} from 'server';
import './style.less'

const {Sider} = Layout;
const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class HelpSlideBar extends React.Component {
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
			<Sider className="help-slider">
				<h4 className="ant-menu-item-customer">
          <span style={{color: '#3b465f'}}>
            <IconFont type="iconfont-yijianfankui" className="text-muted h1" style={{verticalAlign: 'middle'}} />
            <span className="prl1">常见问题</span>
          </span>
				</h4>
				<Menu mode="inline" selectedKeys={[this.props.menuIndex]}>
					{
						this.state.questionTypeList.map((item, index) => {
							return (
								<Menu.ItemGroup key={index} style={{marginTop: '20px'}} title={
									<span className="h4 text-black prl3">{item.name}</span>
								}>
									{
										item.smalls.map((subItem, subIndex) => {
											return (
												<Menu.Item key={subItem.id}>
													<Link
														replace
														href={`/help/index?parentId=${item.id}&curId=${subItem.id}`}
													>
														<div className="h5">{subItem.name}</div>
													</Link>
												</Menu.Item>
											)
										})
									}
								</Menu.ItemGroup>
							)
						})
					}
				</Menu>
			</Sider>
		)
	}
}

export default withRouter(HelpSlideBar)
