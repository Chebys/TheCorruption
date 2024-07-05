const path='/The Corruption/'

const assets=[],images={},audios={}

const eventName={
	image:'load',
	audio:'canplaythrough'
}

class Asset{
	constructor(type,name,cx,cy,width,height){
		this.type=type
		this.name=name
		if(type=='image'){
			this.src=new Image()
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
	load(onload){//考虑做成异步函数？
		var e=eventName[this.type]
		this.src.addEventListener(e,onload,{once:true})
		this.src.src=this.url
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

function drawImage(ctx,{src,cx,cy,width,height},x,y,noCenter){
	var a=noCenter?[src,x,y]:[src,x-cx,y-cy]
	width&&height?ctx.drawImage(...a,width,height):ctx.drawImage(...a)
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
new Asset('audio','bg.mp3')

function loadAssets(onload,beforeEach){
	var i=0,len=assets.length
	function loadNext(){
		if(i<len){
			beforeEach?.(i,len)
			assets[i++].load(loadNext)
		}else{
			onload?.()
		}
	}
	loadNext()
}

global('GetImage', name=>images[name]||images.default)

export {loadAssets, images, audios}