import React, {Fragment} from 'react';
import NextHead from './components/NextHead';
import CommonHeader from './components/CommonHeader/';
import Header from './components/NavBarForInvite/';
import Footer from './components/Footer/';
import './style.less'
import '../../static/customer.less'
import {LocaleProvider} from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

export default ({title, mainMenuIndex, children}) => (
    <LocaleProvider locale={zh_CN}>
        <Fragment>
            <NextHead title={title} />
            <CommonHeader />
            <Header mainMenuIndex={mainMenuIndex}/>
            <div className='content-container'>
                {children}
            </div>
            <Footer />
        </Fragment>
	</LocaleProvider>

);
