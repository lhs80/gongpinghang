import {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForCart/';
import Footer from './components/Footer/';
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import './style.less'
import '../../static/customer.less'
import React from 'react';

export default ({title, searchType, searchKey, menuIndex, children, isHome, showBigImage, controlSearchSuggest}) => (
	<LocaleProvider locale={zh_CN}>
		<Fragment>
			<NextHead title={title} />
			<CommonHeader isHome={isHome ? isHome : false} />
			<Header searchType={searchType} searchKey={searchKey} menuIndex={menuIndex} controlSearchSuggest={controlSearchSuggest} />
			{
				showBigImage ?
					<div>
						<img src="/static/images/bg-material-add-inquiry.png" alt="" />
					</div>
					:
					''
			}
			<div className='content-container'>
				{children}
			</div>
			<Footer />
		</Fragment>
	</LocaleProvider>
);
