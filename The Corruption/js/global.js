function global(name, val){
	if(name in globalThis)console.warn(`Global variable "${name}" already exist!`)
	globalThis[name]=val
}
function DeepCopy(obj, tar){
	if(typeof obj!='object')return obj
	tar=tar||{}
	for(let k in obj)tar[k]=DeepCopy(obj[k])
	return tar
}
function XHRPromise(url, method){
	//XHRPromise(url).onprogress(fn).then(onload)
	//或res=await XHRPromise(url).onprogress(fn)
	var xhr=new XMLHttpRequest
	xhr.open(method||'GET', url)
	xhr.responseType='blob' //应该不会丢数据
	var XHRP=new Promise(resolve=>{
		xhr.send()
		xhr.onload=()=>{
			//判断xhr.status。。。
			var res=new Response(xhr.response)
			resolve(res)
		}
	})
	XHRP.onprogress=fn=>{
		xhr.onprogress=fn
		return XHRP
	}
	return XHRP
}

global('global', global)
global('DeepCopy', DeepCopy)
global('XHRPromise', XHRPromise)

global('WIDTH', 1200)
global('HEIGHT', 800)
