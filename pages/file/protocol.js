import React from 'react'
import Layout from 'components/Layout/index'
import {getProtocolInfoFun} from 'server'

const {Content} = Layout;
export default class Protocol extends React.Component {
	constructor(props) {
		super(props);
		this.content = '';
		this.state = {
			content: '',
			title: ''
		}
	}

	componentDidMount() {
		this.getProtocolInfo();
	}

	getProtocolInfo = () => {
		let params = {
			protocolId: 9
		};
		getProtocolInfoFun(params).then(res => {
			this.setState({
				content: res.data.protocolContext,
				title: res.data.protocolName
			})
		}).catch(error => {
			console.log(error)
		})
	};

	render() {
		return (
			<Layout title="工品行门户，询建材，找建材上工品行，免费信息价查询-建筑课程教学一站式服务">
					<section className="page-content ptb4" style={{background: '#F0F3EF'}}>
						<section className="page-content-wrapper h4 bg-white  text-darkgrey" style={{padding: '80px 106px'}}>
							<div className="large text-center"><b>{this.state.title}</b></div>
							<div dangerouslySetInnerHTML={{__html: this.state.content}} />
						</section>
					</section>
			</Layout>
		)
	}
}
