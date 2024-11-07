const canvas = document.createElement('canvas'), ctx=canvas.getContext('2d', {alpha:false})
canvas.width = CANVAS_WIDTH
canvas.height = CANVAS_HEIGHT
canvas.getPosFromDoc = function(x,y){ //网页坐标转化为canvas坐标
	var rect=this.getBoundingClientRect()
	return [x*CANVAS_WIDTH/rect.width, y*CANVAS_HEIGHT/rect.height]
}
canvas.getMousePos = function(e){ //从鼠标事件获取canvas坐标
	return this.getPosFromDoc(e.offsetX, e.offsetY)
}
document.body.replaceChildren(canvas) //保证代码加载完毕后执行
//ctx.imageSmoothingEnabled=false

addEventListener('load', zoom)
addEventListener('resize', zoom)
function zoom(){
	if(innerWidth/innerHeight >= CANVAS_WIDTH/CANVAS_HEIGHT){
		canvas.style.width=''
		canvas.style.height='100vh'
	}else{
		canvas.style.width='100vw'
		canvas.style.height=''
	}
}

export {canvas, ctx}