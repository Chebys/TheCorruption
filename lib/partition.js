function partition(a){
	/*输入（正）数组a[0],a[1],...,a[n-1]，返回分段函数
		f(x) =	0,		x<a[0]
				1,		a[0]<=x<a[0]+a[1]
				...
				n-1,	a[0]+a[1]+...+a[n-2]<=x<a[0]+a[1]+...+a[n-1]
				n,		x>=a[0]+a[1]+...+a[n-1]
	*/
	return x=>{
		var i=0, s=a[0]
		while(s<=x && ++i<a.length) s += a[i]
		return i
	}
}

function chooseRandom(objs, weights){
	if(weights){
		let total=0, f=partition(weights)
		for(let w of weights)total+=w
		return objs[f(Math.random()*total)]
	}
	return objs[Math.floor(Math.random()*objs.length)]
}

export {partition, chooseRandom}