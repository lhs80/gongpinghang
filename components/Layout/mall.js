import {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/MallHeader/';
import Footer from './components/Footer/';
import './style.less'
import '../../static/customer.less'


export default ({showBigImage, title, searchType, searchKey, children}) => (
	<Fragment>
		<NextHead title={title} />
		<CommonHeader />
		<Header />
		{
			showBigImage ?
				<div>
					<img src="/static/images/img-mall.png" alt="" />
				</div>
				:
				''
		}
		<div className='content-container'>
			{children}
		</div>
		<Footer />
	</Fragment>
);
