import {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForHelp/';
import Footer from './components/Footer/';
import SlideBar from './components/SlideBarForContact';
import {Layout} from 'antd'
import './style.less'
import '../../static/customer.less'

const {Content} = Layout;
export default ({menuIndex, mainMenuIndex, children, title}) => (
	<Fragment>
		<NextHead title={title} />
		<CommonHeader />
		<Header mainMenuIndex={mainMenuIndex} />
		<Layout className='content-container mt2'>
			<SlideBar menuIndex={menuIndex} />
			<Content>
				{children}
			</Content>
		</Layout>
		<Footer />
	</Fragment>
);
