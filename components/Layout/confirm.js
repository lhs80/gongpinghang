import React,{Fragment} from 'react';
import ClientRedirect from '../ClientRedirect'
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForConfirm/';
import Footer from './components/Footer/';
import FixedTool from 'components/FixedTool/';
import {Layout, LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import './style.less'
import '../../static/customer.less'

const {Content} = Layout;

export default ({title, menuIndex, mainMenuIndex, children}) => (
	<LocaleProvider locale={zh_CN}>
		<Fragment>
			<NextHead title={title} />
			<CommonHeader />
			<Header mainMenuIndex={mainMenuIndex} />
			<Layout className='content-container mt2'>
				<Content>
					<ClientRedirect from="" to="/login/index">
						{children}
					</ClientRedirect>
				</Content>
			</Layout>
			{/*在线客服意见反馈*/}
			<FixedTool />
			<Footer />
		</Fragment>
	</LocaleProvider>
);
