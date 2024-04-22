const WIDTH=1200,HEIGHT=800
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d',{alpha:false})
canvas.width=WIDTH
canvas.height=HEIGHT
canvas.getPosFromDoc=function(x,y){//网页坐标转化为canvas坐标
	var rect=this.getBoundingClientRect()
	return [x*WIDTH/rect.width,y*HEIGHT/rect.height]
}
canvas.getMousePos=function(e){//从鼠标事件获取canvas坐标
	return this.getPosFromDoc(e.offsetX,e.offsetY)
}
document.body.appendChild(canvas)
ctx.imageSmoothingEnabled=false

addEventListener('load',zoom)
addEventListener('resize',zoom)
function zoom(){
	if(innerWidth/innerHeight>=WIDTH/HEIGHT){
		canvas.style.width=''
		canvas.style.height='100vh'
	}else{
		canvas.style.width='100vw'
		canvas.style.height=''
	}
}

export {canvas,ctx}