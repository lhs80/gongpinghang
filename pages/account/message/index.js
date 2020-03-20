// 用户中心
import React from 'react'
import Link from 'next/link'
import Layout from 'components/Layout/message'
import {List, Icon, Avatar, Row, Col} from 'antd';
import {iconUrl} from 'config/evn'
import {querySysMsgFun, queryMaterialMsgFun, timestampToTime} from 'server'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

export default class Message extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			curType: 0,
			curPage: 0,
			list: [],
			sysList: []
		};
		this.data = [
			{
				title: 'Ant Design Title 1',
			},
			{
				title: 'Ant Design Title 2',
			},
			{
				title: 'Ant Design Title 3',
			},
			{
				title: 'Ant Design Title 4',
			},
		];
	}

	componentDidMount() {
		this.queryMaterialMsg();
	}

	/**
	 * 系统消息
	 * */
	querySysMsg() {
		querySysMsgFun(this.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					sysList: res.data
				})
			}
		})
	}

	/**
	 * 询价采购消息
	 * */
	queryMaterialMsg() {
		queryMaterialMsgFun(this.userCode, this.state.curPage).then(res => {
			if (res.result === 'success') {
				this.setState({
					list: res.data
				})
			}
		})
	}

	render() {
		return (
			<Layout title="个人中心" menuIndex={'1'} mainMenuIndex={'message'}>
				<aside>
					<Row className="message-bar">
						<Col span={12}>
							{/*<span className="title active">全部消息</span>*/}
							<span className={`title ${this.state.curType === 0 ? 'active' : ''}`}>询价采购</span>
							<span className={`title ${this.state.curType === 1 ? 'active' : ''}`}>系统消息</span>
						</Col>
						<Col span={12} className="text-right">
							{/*<span className="h5 text-darkgrey" style={{marginRight: "60px"}}>*/}
							{/*<IconFont type="iconfont-xiaoxi" className="text-muted h1"/> 全部设置为已读*/}
							{/*</span>*/}
							{/*<span className="h5 text-darkgrey">*/}
							{/*<IconFont type="iconfont-htmal5icon17" className="text-muted h1"/> 清空全部消息*/}
							{/*</span>*/}
						</Col>
					</Row>
				</aside>
				<aside className="bg-white mt1 ptb4 prl6">
					{
						this.state.curType === 0 ?
							<List size="large" itemLayout="horizontal" dataSource={this.state.list} renderItem={item => (
								<List.Item>
									<List.Item.Meta
										avatar={<Avatar size={50} src='/static/images/icon-bell.png' />}
										title={<span className="text-muted">{timestampToTime(item.createTime)}</span>}
										description={
											<Link to={`/myinquirydetail/${JSON.parse(item.params).inquirySheetId}`} className="mt1 text-darkgrey h5"
											      style={{width: '80%', lineHeight: '1.2'}}>
												{item.content}
											</Link>
										}
									/>
								</List.Item>
							)}
							/>
							:
							<List size="large" itemLayout="horizontal" dataSource={this.state.sysList} renderItem={item => (
								<List.Item>
									<List.Item.Meta
										avatar={<Avatar size={50} src='/static/images/icon-bell.png' />}
										title={<span className="text-muted">{timestampToTime(item.createTime)}</span>}
										description={
											<span className="mt1 text-darkgrey h5" style={{width: '80%', lineHeight: '1.2'}}>
                                {item.content}
                              </span>
										}
									/>
								</List.Item>
							)}
							/>
					}
				</aside>
			</Layout>
		)
	}
}
