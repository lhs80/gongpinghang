import Head from 'next/head';
import React from "react";

export default (props) => (
	<Head>
		<title>{props.title}</title>
		{/*<meta name='viewport' content='width=device-width, initial-scale=1' />*/}
		<meta name='viewport' content='initial-scale=1, maximum-scale=1, minimum-scale=0.1, user-scalable=yes' className='next-head'/>
		<meta charSet='utf-8' />
		{/*<meta name="keywords" content="工品行 – 买建材询价上工品行！"/>*/}
		{/*<meta name="description" content="工品行秉承“开放透明，材正价优”的服务准则，通过“互联网+建材”，布局全国仓配物流网络，实现库存共享及订单集成处理，彻底颠覆了建材行业传统的线下采购模式，为用户提供一站式建材服务，为品牌商家提供一站式解决方案。"/>*/}
    <meta name="baidu-site-verification" content="fZMohYR95D" />
		<link rel="stylesheet" href="//at.alicdn.com/t/font_1037336_0t37vq8dilxg.css" />
		<link rel="stylesheet" href="/static/sprite.css" />
		<link rel="shortcut icon" href="/static/images/favicon.ico" />
		<script src="https://cdn.bootcss.com/Swiper/4.4.6/js/swiper.js" />
		<script src="/static/js/getTime.js" />
		<script src="https://webapi.amap.com/maps?v=1.4.7&key=8e9b779239d7a4d0e39aef82d8fbb292&plugin=AMap.Geocoder,AMap.Geolocation,AMap.CitySearch" />
		{/*<script src="https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/7.4.4/polyfill.js" />*/}
		<script src="/static/js/polyfill.js" />
		<script src="/static/js/NIM_Web_SDK_v5.6.0.js" />
	</Head>
);

