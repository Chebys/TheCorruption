const path='/The Corruption/img/'

const assets=[],images={},audios={}

class Asset{
	constructor(type,name,cx,cy){
		this.type=type
		this.name=name
		if(type=='image'){
			this.src=new Image()
			this.src.src=path+name+'.png'
			this.cx=cx||0 //实体中心在图片中的坐标（可超出图片，如飞行单位）
			this.cy=cy||0
			images[name]=this
		}else if(type=='audio'){
			audios[name]=this
		}
		assets.push(this)
	}
	load(onload){//考虑做成异步函数？
		if(this.src.complete)onload()
		else this.src.onload=onload
	}
}

new Asset('image','test')
new Asset('image','default',32,64)
new Asset('image','homebase',32,32)
new Asset('image','corrupter',32,48)
new Asset('image','ball',16,16)

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

export {loadAssets,images}