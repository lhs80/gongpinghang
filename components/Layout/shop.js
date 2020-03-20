import React, {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForShop/';
import Footer from './components/Footer/';
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import './style.less'
import '../../static/customer.less'

export default ({title, mainMenuIndex, children, shopInfo, productId, isUpdateCartNum}) => (
	<LocaleProvider locale={zh_CN}>
		<Fragment>
			<NextHead title={title} />
			<CommonHeader />
			<Header mainMenuIndex={mainMenuIndex} shopInfo={shopInfo} productId={productId} isUpdateCartNum={isUpdateCartNum} />
			<div className='content-container'>
				{children}
			</div>
			<Footer />
		</Fragment>
	</LocaleProvider>
);
