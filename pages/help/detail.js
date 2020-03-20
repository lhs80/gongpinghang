// 帮助中心
import React from 'react'
import Layout from 'components/Layout/help'
import {withRouter} from 'next/router'
import {Divider, Icon} from 'antd';
import {questionListHotFun, questionListTypeFun, questiodetailFun} from 'server'
import './help.less'

class HelpDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			content: {},
		}
	}

	componentDidMount() {
		this.questionContent();
	}


	componentDidUpdate(prevProps) {
		if (prevProps.router.query.id !== this.props.router.query.id) {
			this.questionContent();
		}
	}

	questionContent() {
		questiodetailFun(this.props.router.query.id).then(res => {
			if (res.result === 'success') {
				this.setState({
					content: res.data
				})
			}
		})
	}

	render() {
		return (
			<Layout title="帮助中心">
				<section className="bg-white ptb2">
					<h4 className="prl3 text-darkgrey">{this.state.content.question}</h4>
					<Divider />
					<aside className="mt4 prl5 h5">
						{this.state.content.answer}
					</aside>
				</section>
			</Layout>
		)
	}
}

export default withRouter(HelpDetail)
