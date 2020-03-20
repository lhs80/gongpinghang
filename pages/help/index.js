// 帮助中心
import React from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'
import PageLayout from 'components/Layout/help'
import {Layout, Divider, Icon} from 'antd';
import {iconUrl, baseUrl} from 'config/evn'
import {questionListHotFun, questionListTypeFun, questiodetailFun} from 'server'
import cookie from 'react-cookies';

const IconFont = Icon.createFromIconfontCN({
	scriptUrl: iconUrl,   //阿里巴巴图标引用地址
});

class HelpPanel extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			questionList: [],
			questionTypeList: [],
			curId: '',//this.props.match.params.type === 'hot' ? "" : this.props.match.params.type,
			parentId: '',//this.props.match.params.parentId,
		}
	}

	componentDidMount() {
		this.questionList();
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			curId: nextProps.router.query.type === 'hot' ? '' : nextProps.router.query.type,
			parentId: nextProps.router.query.parentId,
		}, () => {
			this.questionList();
		})
	}

	questionList() {
		this.setState({
			curId: this.props.router.query.curId
		}, () => {
			questionListHotFun(this.state.curId).then(res => {
				if (res.result === 'success') {
					this.setState({
						questionList: res.data
					})
				}
			})
		})
	}

	render() {
		return (
			<PageLayout title="帮助中心" mainMenuIndex={'help'} menuIndex={this.props.router.query.curId}>
				<section className="bg-white ptb2" style={{minHeight: '400px'}}>
					<h4 className="prl3 text-darkgrey">热门问题</h4>
					<Divider />
					<aside className="mt4 prl5">
						{
							this.state.questionList.map((item, index) => {
								return (
									<div key={index}>
										<h4>
											<IconFont type="iconfont-bangzhu" className="text-muted h1"
											          style={{verticalAlign: 'middle'}} />
											<span className="prl2 text-darkgrey">{item.question}</span>
										</h4>
										<div className="mt2 help-answer-panel text-ellipsis">
											<Link href={{pathname: '/help/detail', query: {id: item.id}}}>{item.answer}</Link>
										</div>
									</div>
								)
							})
						}
					</aside>
				</section>
			</PageLayout>
		)
	}
}

export default withRouter(HelpPanel)
