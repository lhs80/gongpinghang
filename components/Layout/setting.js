import {Fragment} from 'react';
import NextHead from './components/NextHead';
import ClientRedirect from '../ClientRedirect'
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForAccount/';
import Footer from './components/Footer/';
import SlideBar from './components/SettingSlideBar/';
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
				<SlideBar menuIndex={menuIndex} />
				<ClientRedirect from="" to="/login/index"><Content>{children}</Content></ClientRedirect>
			</Layout>
			<Footer />
		</Fragment>
	</LocaleProvider>
);
