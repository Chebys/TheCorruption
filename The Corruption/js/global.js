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
	//XHRPromise(url, {onProgress}).then(onload)
	var {method, body, onProgress, onUploadProgress, signal} = opts;
	var xhr = new XMLHttpRequest;
	xhr.open(method||'GET', url);
	xhr.responseType = 'blob'; //应该不会丢数据
	xhr.onprogress = onProgress;
	xhr.upload.onprogress = onUploadProgress;
	signal?.addEventListener('abort', ()=>xhr.abort());
	return new Promise((resolve, reject)=>{
		xhr.send(body); //可能需要转换
		//这里尽量和fetch规范一致：fetch() 的 promise 不会因为服务器响应表示错误的 HTTP 状态码而被拒绝
		xhr.onload = ()=>resolve(new Response(xhr.response));
		xhr.onabort = ()=>reject(new DOMException(signal.reason||'no reason', 'AbortError'));
	});
}

global('global', global)
global('DeepCopy', DeepCopy)
global('XHRPromise', XHRPromise)
global('nullfn', _=>null)

global('BRANCH', location.hostname=='localhost'?'dev':'release')
global('ROOT_PATH', '/The Corruption/')
global('CANVAS_WIDTH', 1200)
global('CANVAS_HEIGHT', 800)

if(!Promise.withResolvers)Promise.withResolvers = ()=>{ //polyfill
	var resolve, reject
	var promise = new Promise((r, t)=>{
		resolve = r
		reject = t
	})
	return {promise, resolve, reject}
}