const path='/The Corruption/'

const assets=[],images={},audios={}

const eventName={
	image:'load',
	audio:'canplaythrough'
}

class Asset{
	constructor(type,name,cx,cy){
		this.type=type
		this.name=name
		if(type=='image'){
			this.src=new Image()
			this.url=path+'img/'+name+'.png'
			this.cx=cx||0 //实体中心在图片中的坐标（可超出图片，如飞行单位）
			this.cy=cy||0
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
	draw(ctx,x,y,angle){
		if(angle){
			ctx.translate(x,y)
			ctx.rotate(angle)
			drawImage(ctx,this,0,0)
			ctx.setTransform(1, 0, 0, 1, 0, 0) //归位
		}
		else drawImage(ctx,this,x,y)
	}
	play(reset){//反复？
		if(reset)this.src.currentTime=0
		this.src.play()
	}
	pause(){
		this.src.pause()
	}
}

function drawImage(ctx,{src,cx,cy},x,y){
	ctx.drawImage(src,x-cx,y-cy)
}

new Asset('image','test')
new Asset('image','default',32,64)
new Asset('image','homebase',32,32)
new Asset('image','corrupter',32,48)
new Asset('image','ball',16,16)
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

export {loadAssets,images,audios}