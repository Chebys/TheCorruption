const path='/The Corruption/'

const assets=[], images={}, audios={}

const eventName={
	image:'load',
	audio:'canplaythrough'
}

class Asset{
	constructor(type,name,cx,cy,width,height){
		this.type=type
		this.name=name
		if(type=='image'){
			//this.src=new Image()
			this.url=path+'img/'+name+'.png'
			this.cx=cx||0 //实体中心在图片中的坐标（可超出图片，如飞行单位）
			this.cy=cy||0
			this.width=width
			this.height=height
			images[name]=this
		}else if(type=='audio'){
			this.src=new Audio()
			this.url=path+'audio/'+name
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
	draw(ctx,x,y,opt){
		//opt为true时，表示以图片左上角为中心；为数字时，表示旋转角度
		if(opt===true)drawImage(ctx,this,x,y,true)
		else if(typeof opt=='number'){
			ctx.translate(x,y)
			ctx.rotate(opt)
			drawImage(ctx,this,0,0)
			ctx.setTransform(1, 0, 0, 1, 0, 0) //归位
		}
		else drawImage(ctx,this,x,y)
	}
	play(reset){//反复？
		if(reset)this.src.currentTime=0
		//this.src.play()
	}
	pause(){
		this.src.pause()
	}
}
function GetImage(name){
	var img=images[name]||images.default
	return img.bitmap
}
function drawImage(ctx, {bitmap,cx,cy,width,height}, x, y, noCenter){
	var a=noCenter?[bitmap,x,y]:[bitmap,x-cx,y-cy]
	width&&height ? ctx.drawImage(...a, width, height) : ctx.drawImage(...a)
}
function PlaySound(name, config={}){
	
}

new Asset('image','mainmenu')

new Asset('image','info_tile0')
new Asset('image','info_tile1')
new Asset('image','info_tile2')
new Asset('image','default',32,64)

new Asset('image','homebase',32,32)
new Asset('image','archertower',64,96)
new Asset('image','arrow',16,16)
new Asset('image','tower1',32,48)
new Asset('image','ball',16,16)
new Asset('image','corrupter',32,48)

//new Asset('audio','bg.mid') 不支持的格式
//new Asset('audio','bg.mp3')
async function loadImage(name, blob){
	var img=images[name]||new Asset('image',name) 
	await img.load(blob)
}
function loadAssets0(onload,beforeEach){
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
async function loadAssets(onload){
	var data={}
	var res=await fetch(path+'data/blob.txt')
	data.blob=await res.blob()
	res=await fetch(path+'data/meta.json')
	res=await res.text()
	data.meta=JSON.parse(res)
	await importAssets(data)
	onload()
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
		meta:{
			names:names,
			sizes:sizes
		},
		blob:new Blob(blobs)
	}
}
function exportToFile(){
	var {meta, blob}=exportAssets()
	var jsonstr=JSON.stringify(meta)
	var metablob=new Blob([jsonstr])
	DownloadBlob(metablob, 'meta.json')
	DownloadBlob(blob, 'blob.txt') //dat格式会404
}
async function importAssets({meta:{names,sizes}, blob}){
	var start=0
	for(let i=0;names[i];i++){
		let end=start+sizes[i]
		let raw=blob.slice(start,end)
		await loadImage(names[i], raw)
		start=end
	}
}
global('test',async _=>{
	var data={}
	var res=await fetch(path+'data/blob.txt')
	data.blob=await res.blob()
	res=await fetch(path+'data/meta.json')
	res=await res.text()
	data.meta=JSON.parse(res)
	await importAssets(data)
})

global('exportToFile', exportToFile)
global('importAssets', importAssets)
global('GetImage', GetImage)
global('PlaySound', PlaySound)

export {loadAssets, images, audios}