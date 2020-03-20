import React from 'react'
import Link from 'next/link'
import './style.less'
import {Row, Col, Tabs, message} from 'antd'
import {
	getAnswer
} from 'server'

const {TabPane} = Tabs;

export default class Banner extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			answerList: [],
		}
	}

	componentDidMount() {
		this.queryBuyAnswerList();
	}

	queryBuyAnswerList = () => {
		let params = {
			type: this.props.type
		};
		getAnswer(params).then(res => {
			this.setState({
				answerList: res.data
			})
		}).catch(error => {
			message.error(error);
		})
	};

	render() {
		const {type} = this.props;
		const {answerList} = this.state;
		return (
			<aside className="answer-panel">
				<Row type='flex' align="middle">
					<Col span={12} className="h2"><h2><b>{type === 1 ? '买家入门' : '卖家入门'}</b></h2></Col>
					{
						type === 1 ?
							<Col span={12} className="h5 text-muted text-right">
								<Link href={{pathname: 'help/index', query: {parentId: 4, curId: 8}}}><a>更多>></a></Link>
							</Col>
							:
							<Col span={12} className="h5 text-muted text-right">
								<Link href={{pathname: 'help/index', query: {parentId: 2, curId: 4}}}><a>更多>></a></Link>
							</Col>
					}
				</Row>
				<div className="mt2" style={{overflow: 'hidden'}}>
					<div className="cover-image"><img src={type === 1 ? '/static/images/buyer.png' : '/static/images/saler.png'} alt='' /></div>
					<div className="question-list">
						<Tabs animated={false}>
							{
								answerList && answerList.map((item, index) => {
									return (
										<TabPane key={item.id} tab={<b>{item.name}</b>}>
											<ul>
												{
													item.list.map((question, key) => {
														return (
															<li key={key} className="text-ellipsis h6" style={{height: '30px'}}>
																<Link href={{pathname: '/help/detail', query: {id: question.id}}}><a>{question.question}</a></Link>
															</li>
														)
													})
												}
											</ul>
										</TabPane>
									)
								})
							}
							{/*<TabPane key="1" tab={type === 1 ? '采购单管理' : '店铺管理'}>*/}
							{/*<ul>*/}
							{/*<li>买家完成认证将获得哪些权益</li>*/}
							{/*</ul>*/}
							{/*</TabPane>*/}
							{/*<TabPane key="2" tab={type === 1 ? '询价单管理' : '报价管理'}>*/}
							{/*<ul>*/}
							{/*<li>买家完成认证将获得哪些权益</li>*/}
							{/*</ul>*/}
							{/*</TabPane>*/}
						</Tabs>
					</div>
				</div>
			</aside>
		)
	}
};
