function global(name, val){
	if(name in globalThis)console.warn(`Global variable "${name}" already exist!`)
	globalThis[name]=val
}
function DeepCopy(obj, tar={}){
	if(typeof obj!='object')return obj
	for(let k in obj)tar[k]=DeepCopy(obj[k])
	return tar
}
function XHRPromise(url, opts={}){
	//XHRPromise(url, {onprogress:fn}).then(onload)
	var {method, body, onprogress} = opts
	var xhr=new XMLHttpRequest
	xhr.open(method||'GET', url)
	xhr.responseType='blob' //应该不会丢数据
	xhr.onprogress=onprogress
	return new Promise((resolve, reject)=>{
		xhr.send(body) //可能需要转换
		xhr.onload=()=>{
			if(xhr.status!=200)reject('http error: '+xhr.status+' at '+url)
			var res=new Response(xhr.response)
			resolve(res)
		}
	})
}

global('global', global)
global('DeepCopy', DeepCopy)
global('XHRPromise', XHRPromise)
global('nullfn', _=>null)

global('BRANCH', location.hostname=='localhost'?'dev':'release')
global('ROOT_PATH', '/The Corruption/')
global('WIDTH', 1200)
global('HEIGHT', 800)
