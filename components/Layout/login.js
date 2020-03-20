import {Fragment} from 'react';
import NextHead from './components/NextHead';
import Footer from './components/LoginFooter/';
import {LocaleProvider, Layout} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import './style.less'
import '../../static/customer.less'
import React from 'react';

const {Header, Content} = Layout;
export default ({title, searchType, searchKey, menuIndex, children, className}) => (
	<LocaleProvider locale={zh_CN}>
		<Fragment>
			<NextHead title={title} />
			<Layout className={className}>
				<Header className="login-head">
					<div className="login-head-wrapper">
						<a href="/">
							<img src="/static/sprites/logo.png" alt="" />
						</a>
					</div>
				</Header>
				<Content className='login-container'>
					{children}
				</Content>
				<Footer />
			</Layout>
		</Fragment>
	</LocaleProvider>
);
