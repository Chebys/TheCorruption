const assets=Dict(), images=Dict(), sounds=Dict()

class Asset{
	constructor(path){
		this.path = path
		assets[path] = this
	}
	async load(blob){
		if(blob){
			this.raw=blob
		}else{
			let res=await fetch(ROOT_PATH+this.path)
			this.raw=await res.blob()
		}
	}
	getRaw(){ //返回blob（如果已加载）
		return this.raw
	}
}
class Image extends Asset{
	constructor(name){
		super('img/'+name+'.png')
		images[name]=this
	}
	async load(blob){
		await super.load(blob)
		this.bitmap=await createImageBitmap(this.raw)
	}
}
class Sound extends Asset{
	constructor(name){
		super('audio/'+name+'.mp3')
		sounds[name]=this
	}
	async load(blob){
		await super.load(blob)
		this.obj_url=URL.createObjectURL(this.raw)
	}
	play(reset){ //废弃
		if(reset)this.raw.currentTime=0
		//this.raw.play()
	}
	pause(){ //废弃
		this.raw.pause()
	}
}

function getAssetByPath(path){
	var asset = assets[path]
	if(asset)return asset
	throw new Error('undefind asset: '+path)
}

function loadAsset(path, blob){ //返回Promise
	return getAssetByPath(path).load(blob)
}
function loadAssetsOld(onload, beforeEach){ //老式加载；exportAssets 之前使用
	var i = 0,
		assetList = Object.values(assets),
		len = assetList.length
	function loadNext(){
		if(i<len){
			beforeEach?.(i,len)
			assetList[i++].load().then(loadNext)
		}else{
			onload?.()
		}
	}
	loadNext()
}

function exportAssets(){
	var blobs=[], paths=[], sizes=[]
	for(let path in assets){
		paths.push(path)
		let blob=assets[path].getRaw()
		blobs.push(blob)
		sizes.push(blob.size)
	}
	return {
		meta:{paths, sizes},
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
async function loadAssets(onprogress){
	var meta_url = ROOT_PATH+'data/meta.json'
	var blob_url = ROOT_PATH+'data/blob.bin'
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
async function importAssets({meta:{paths,sizes}, blob}){ //只能导入已实例化的 Asset
	var expected_size = sizes.reduce((s,x)=>s+x)
	if(expected_size != blob.size)throw new Error('资源大小不匹配！', {
		cause: {expected_size, actual_size:blob.size}
	})
	var start=0
	for(let i=0; paths[i]; i++){
		let end=start+sizes[i]
		let raw=blob.slice(start,end)
		await loadAsset(paths[i], raw)
		start=end
	}
}
function checkAssets(){
	for(let a of Object.values(assets))
		if(!a.getRaw()){
			console.warn('未加载的资源：', a)
			return false
		}
	return true
}

//加载完成后，可使用以下函数
function GetImage(name){ //总是返回 ImageBitmap 对象
	var img=images[name]
	if(!img){
		logOnce(`图片 ${name} 不存在`, 'warn')
		img=images.default
	}
	return img.bitmap
}
function GetAudio(name){ //返回原生Audio对象或undefined；返回的Audio总是new的
	var sound=sounds[name]
	if(!sound)return
	return new Audio(sound.obj_url)
}

new Image('default') //必须

new Image('mainmenu')

new Image('info_tile0')
new Image('info_tile1')
new Image('info_tile2')

new Image('archertower')
new Image('arrow')
new Image('ball')
new Image('corrupter')
new Image('goldmine')
new Image('homebase')
new Image('tower1')

//new Asset('audio','bg.mid') 不支持的格式
new Sound('bg')

if(BRANCH=='dev')
	global('quickExport', callback=>{
		loadAssetsOld(()=>{
			exportToFile()
			callback?.()
		})
	})

global('GetImage', GetImage)
global('GetAudio', GetAudio)

export {loadAssets, checkAssets}