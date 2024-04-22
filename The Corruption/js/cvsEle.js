var canvas,ctx

//尽量不要为互相遮挡的元素注册相同事件的监听，无法保证顺序
var elements=[]
var listeners={
	mousemove:new Map(),
	mousedown:new Map(),
	click:new Map()
}
var defaultFont='20px sans-serif'
var defaultcolor='#fff'
/*style:
	bgcolor
	img  Asset对象
	border:{
		width
		color
	}
	radius
	text
	font
	color
	textAlign
	padding 单个数值；有更复杂的需求，请将文本作为独立element
*/
class CvsEle{
	constructor(x,y,width,height,style={}){
		this.x1=x
		this.y1=y
		this.x2=x+width
		this.y2=y+height
		this.style=style
		this.path=new Path2D()
		if(style.radius){
			
		}else{
			this.path.rect(x,y,width,height)
		}
		elements.push(this)
	}
	hide(){
		this.hidden=true
	}
	show(){
		this.hidden=false
	}
	text(t){
		this.style.text=t
	}
	img(i){
		this.style.img=i
	}
	draw(){
		if(this.style.img){
			ctx.drawImage(this.style.img.src,this.x1,this.y1)
		}else if(this.style.bgcolor){
			ctx.fillStyle=this.style.bgcolor
			ctx.fill(this.path)
		} 
		if(this.style.border){
			let {width,color}=this.style.border
			ctx.lineWidth=width
			ctx.strokeStyle=color
			ctx.stroke(this.path)
		}
		if(this.style.text){
			ctx.fillStyle=this.style.color||defaultcolor
			ctx.font=this.style.font||defaultFont
			ctx.textAlign=this.style.textAlign
			ctx.textBaseline='top'
			let pd=this.style.padding||0
			ctx.fillText(this.style.text,this.x1+pd,this.y1+pd)
		}
	}
	on(eventName,fn){//fn(event,x,y)
		listeners[eventName].set(this,fn)
	}
	hoverStyle(){
		
	}
	activeStyle(){
		
	}
}
function isTarget(ele,e){
	if(ele.hidden)return false
	var [x,y]=canvas.getMousePos(e)
	if(ele.x1<=x&&x<=ele.x2&&ele.y1<=y&&y<=ele.y2)
		return true
}

function init(c,ctx1){
	if(!c.getMousePos){
		console.log('canvas应具有getMousePos方法')
		return
	}
	canvas=c
	ctx=ctx1||c.getContext('2d')
	for(let name in listeners)
		c.addEventListener(name,e=>{
			console.log()
			for(let [ele,fn] of listeners[name])
				if(isTarget(ele,e)){
					fn(e,...canvas.getMousePos(e))
					return
				}
		})
}
function reset(){
	elements=[]
	for(let k in listeners)listeners[k].clear()
}
function render(clear){//按元素创建的顺序渲染
	if(clear)ctx.clearRect(0,0,canvas.width,canvas.height)
	elements.forEach(e=>e.hidden||e.draw())
}

export {CvsEle,init,reset,render,elements}