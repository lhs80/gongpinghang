// 用户中心会话消息
import React from 'react'
import Layout from 'components/Layout/message'
import dynamic from 'next/dynamic'
import cookie from 'react-cookies';
/*const Message = dynamic(import('./message'), {
    ssr: false
});*/
const Message = dynamic(
	() => import('./message'),
	{
		ssr: false
	}
);
export default class SessionMessage extends React.Component {
	constructor(props) {
		super(props);
		this.userCode = cookie.load('ZjsWeb') ? cookie.load('ZjsWeb').userCode : 'guest';
		this.state = {
			showConnect: 'none',//显示聊天框
			to: '',
			nim: {},
			otherInfo: {},
		};
	}

	render() {
		return (
			<Layout title="消息中心-会话消息" mainMenuIndex="message" menuIndex={'3'}>
				<Message />
			</Layout>
		)
	}
}
