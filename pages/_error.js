import React, {Component} from 'react';
import Router from 'next/router';
import Layout from 'components/Layout/index'
import {Button} from 'antd'
import './home/style/index.less'

class _Error extends Component {
	constructor(props) {
		super(props);

	}

	componentDidMount() {
		this.timer = setTimeout(() => {
			Router.push('/')
		}, 3000)
	}

	componentWillUnmount() {
		clearInterval(this.timer)
	}

	render() {
		return (
			<Layout title="404">
				<section className="maxWidth text-center ptb6">
					<div><img src="/static/images/404.png" alt="" /></div>
					<Button size="large" type="primary" className="h5 mt4" style={{width: '142px'}} onClick={() => {
						Router.push('/')
					}}>返回首页</Button>
				</section>
			</Layout>
		);
	}
}

_Error.propTypes = {};

export default _Error;
