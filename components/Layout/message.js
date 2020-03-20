import {Fragment} from 'react';
import ClientRedirect from '../ClientRedirect'
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForAccount/';
import Footer from './components/Footer/';
import SlideBar from './components/MessageSlideBar/';
import {Layout} from 'antd';
import './style.less'
import '../../static/customer.less'

const {Content} = Layout;

export default ({title, menuIndex, mainMenuIndex, children}) => (
	<Fragment>
		<NextHead title={title} />
		<CommonHeader />
		<Header mainMenuIndex={mainMenuIndex} />
		<Layout className='content-container mt2'>
			<SlideBar menuIndex={menuIndex} />
			<ClientRedirect from="" to="/login/index"> <Content>{children}</Content></ClientRedirect>
		</Layout>
		<Footer />
	</Fragment>
);
