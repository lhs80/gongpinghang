import React from 'react';

export default function ShowRate(props) {
	let {num} = props;
	let images = [];
	let rateLevel = [
		{min: 4, max: 10, type: 1, num: 1},
		{min: 11, max: 40, type: 1, num: 2},
		{min: 41, max: 90, type: 1, num: 3},
		{min: 91, max: 150, type: 1, num: 4},
		{min: 151, max: 250, type: 1, num: 5},
		{min: 151, max: 250, type: 1, num: 5},
		{min: 251, max: 500, type: 2, num: 1},
		{min: 501, max: 1000, type: 2, num: 2},
		{min: 1001, max: 2000, type: 2, num: 3},
		{min: 2001, max: 5000, type: 2, num: 4},
		{min: 5001, max: 1000, type: 2, num: 5},
		{min: 10001, max: 20000, type: 3, num: 1},
		{min: 20001, max: 50000, type: 3, num: 2},
		{min: 50001, max: 100000, type: 3, num: 3},
		{min: 100001, max: 200000, type: 3, num: 4},
		{min: 200001, max: 500000, type: 3, num: 5},
		{min: 200001, max: 500000, type: 3, num: 5},
		{min: 500001, max: 1000000, type: 4, num: 1},
		{min: 1000001, max: 2000000, type: 4, num: 2},
		{min: 2000001, max: 5000000, type: 4, num: 3},
		{min: 5000001, max: 10000000, type: 4, num: 4},
		{min: 10000001, max: '', type: 4, num: 5},
	];
	let level = rateLevel.filter(item => item.min <= num && item.max && item.max >= num);

	if (level.length) {
		let {num, type} = level[0];
		for (let i = 0; i < num; i++) {
			images.push(<i className={`icon-grade_${type}`} style={{display: 'inline-block', marginRight: '4px'}} key={i} />)
		}
	}

	return (
		<span style={{verticalAlign: 'sub', display: 'inline-block', height: '16px'}}>{images}</span>
	)
}
