import {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForInvite/';
import Footer from './components/Footer/';
import SlideBar from './components/InviteSlideBar/';
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
                <div className='content-container'>
                    {children}
                </div>
			</Layout>
			<Footer />
		</Fragment>
	</LocaleProvider>
);
