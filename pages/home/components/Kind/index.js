import React from 'react'
import './style.less'
import {Row, Col, Tabs} from 'antd'
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

			</aside>
		)
	}
};
