function DownloadBlob(blob,name){
	var url=URL.createObjectURL(blob)
	var a=document.createElement('a')
	a.href=url
	a.download=name??'file'
	a.click()
	a.remove()
}
global('DownloadBlob', DownloadBlob)

var sel
global('c_sel', tar=>{
	sel=tar??sel
	return sel
})
global('c_select', tar=>{
	c_sel(tar)
	console.log('c_select', sel)
})

const logged = new Set
global('logOnce', (msg, level='log')=>{
	if(logged.has(msg))return
	logged.add(msg)
	console[level](msg)
})

function sleep(time){ //await sleep(1000)
	return new Promise(resolve=>setTimeout(resolve, time))
}
global('sleep', sleep)