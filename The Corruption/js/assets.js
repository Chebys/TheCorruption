const assets=[], images={}, audios={}

const eventName={
	image:'load',
	audio:'canplaythrough'
}

class Asset{ //todo: 将不同文件格式分别做成class
	constructor(type, name){
		this.type=type
		this.name=name
		if(type=='image'){
			//this.src=new Image()
			this.url=PATH+'img/'+name+'.png'
			images[name]=this
		}else if(type=='audio'){
			this.src=new Audio()
			this.url=PATH+'audio/'+name
			audios[name]=this
		}
		assets.push(this)
	}
	async load(blob){
		/*var e=eventName[this.type]
		this.src.addEventListener(e, onload, {once:true})
		this.src.src=this.url*/
		if(blob){
			this.src=blob
			var originbitmap=this.bitmap
		}else{
			let res=await fetch(this.url)
			this.src=await res.blob()
		}
		this.bitmap=await createImageBitmap(this.src)
		//originbitmap?.close() 有些地方还在用之前GetImage得到的bitmap
	}
	getRaw(){
		return this.src
	}
	play(reset){ //废弃
		if(reset)this.src.currentTime=0
		//this.src.play()
	}
	pause(){ //废弃
		this.src.pause()
	}
}
function GetImage(name){ //总是返回 ImageBitmap
	var img=images[name]
	if(!img){
		logOnce(`图片 ${name} 不存在`, 'warn')
		img=images.default
	}
	return img.bitmap
}

function PlaySound(name, config={}){ //废弃
	
}
function loadImage(name, blob){ //Promise
	var img=images[name]||new Asset('image',name) 
	return img.load(blob)
}
function loadAssetsOld(onload, beforeEach){ //老式加载；exportAssets 之前使用
	var i=0, len=assets.length
	function loadNext(){
		if(i<len){
			beforeEach?.(i,len)
			assets[i++].load().then(loadNext)
		}else{
			onload?.()
		}
	}
	loadNext()
}
async function loadAssets(onprogress){
	var meta_url = PATH+'data/meta.json'
	var blob_url = PATH+'data/blob.bin'
	if(BRANCH=='dev'){
		meta_url += '?'+Math.random()
		blob_url += '?'+Math.random()
	}
	
	var data={}
	
	var res=await XHRPromise(meta_url, {onprogress:onprogress0})
	function onprogress0({loaded, total}){
		onprogress?.({
			stage: 0,
			percent: total ? loaded/total : 0
		})
	}
	data.meta=await res.json()
	
	res=await XHRPromise(blob_url, {onprogress:onprogress1})
	function onprogress1({loaded, total}){
		onprogress?.({
			stage: 1,
			percent: total ? loaded/total : 0
		})
	}
	onprogress?.({stage:2})
	data.blob=await res.blob()
	
	await importAssets(data)
}
function exportAssets(){ //先试试图像
	var blobs=[], names=[], sizes=[]
	for(let img of assets){
		names.push(img.name)
		let blob=img.getRaw()
		blobs.push(blob)
		sizes.push(blob.size)
	}
	return {
		meta:{names, sizes},
		blob:new Blob(blobs)
	}
}
function exportToFile(){
	var {meta, blob}=exportAssets()
	var jsonstr=JSON.stringify(meta)
	var metablob=new Blob([jsonstr])
	DownloadBlob(metablob, 'meta.json')
	DownloadBlob(blob, 'blob.bin')
}
async function importAssets({meta:{names,sizes}, blob}){
	var expected_size = sizes.reduce((s,x)=>s+x)
	if(expected_size != blob.size)throw new Error('资源大小不匹配！', {
		cause: {expected_size, actual_size:blob.size}
	})
	var start=0
	for(let i=0; names[i]; i++){
		let end=start+sizes[i]
		let raw=blob.slice(start,end)
		await loadImage(names[i], raw)
		start=end
	}
}
function checkAssets(){
	for(let a of assets)
		if(!a.getRaw()){
			console.warn('未加载的资源：', a)
			return false
		}
	return true
}

new Asset('image','default') //必须

new Asset('image','mainmenu')

new Asset('image','info_tile0')
new Asset('image','info_tile1')
new Asset('image','info_tile2')

new Asset('image','archertower')
new Asset('image','arrow')
new Asset('image','ball')
new Asset('image','corrupter')
new Asset('image','goldmine')
new Asset('image','homebase')
new Asset('image','tower1')

//new Asset('audio','bg.mid') 不支持的格式
//new Asset('audio','bg.mp3')

if(BRANCH=='dev')
	global('quickExport', callback=>{
		loadAssetsOld(()=>{
			exportToFile()
			callback?.()
		})
	})

global('GetImage', GetImage)
global('PlaySound', PlaySound)

export {loadAssetsOld, loadAssets, images, audios, checkAssets}