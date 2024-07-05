//console.log('debug')
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
function c_sel(tar){
	sel=tar??sel
	console.log('c_sel', sel)
	return sel
}
global('c_sel', c_sel)

function sleep(time){ //await sleep(1000)
	return new Promise(resolve=>setTimeout(resolve, time))
}
global('sleep', sleep)