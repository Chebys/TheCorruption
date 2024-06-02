var canvas,ctx

//尽量不要为互相遮挡的元素注册相同事件的监听，无法保证顺序
//重复注册同一元素同一事件则覆盖
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
	border:{
		width
		color
	}
	radius		符合roundRect语法
	font
	color
	textAlign	"left" || "right" || "center"（默认）
	padding		单个数值；有更复杂的需求，请将文本作为独立element
*/
class CvsEle{
	constructor(x,y,width=0,height=0,style={}){
		this.x1=x
		this.y1=y
		this.x2=x+width
		this.y2=y+height
		this.style=style
		this.path=new Path2D()
		if(style.radius)this.path.roundRect(x,y,width,height,style.radius)
		else this.path.rect(x,y,width,height)
		elements.push(this)
	}
	hide(){
		this.hidden=true
	}
	show(){
		this.hidden=false
	}
	text(t){
		this.intext=t //字符串或函数
	}
	img(i){//Asset对象
		this.image=i
	}
	draw(){
		if(this.style.bgcolor){
			ctx.fillStyle=this.style.bgcolor
			ctx.fill(this.path)
		}
		if(this.image){
			var i=this.image.getRaw(),w=this.x2-this.x1,h=this.y2-this.y1
			ctx.drawImage(i,this.x1,this.y1,w,h)
		}
		if(this.style.border){
			let {width,color}=this.style.border
			ctx.lineWidth=width
			ctx.strokeStyle=color
			ctx.stroke(this.path)
		}
		if(this.intext){
			ctx.fillStyle=this.style.color||defaultcolor
			ctx.font=this.style.font||defaultFont
			ctx.textBaseline='top'
			let pd=this.style.padding||0
			let x,y=this.y1+pd
			switch(this.style.textAlign){
				case 'left':
					ctx.textAlign='left'
					x=this.x1+pd
					break
				case 'right':
					ctx.textAlign='right'
					x=this.x2-pd
					break
				case 'center':
				default:
					ctx.textAlign='center'
					x=(this.x1+this.x2)/2
			}
			var t=this.intext
			ctx.fillText(typeof t=='function'?t():t,x,y)
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
		console.error('canvas应具有getMousePos方法')
		return
	}
	canvas=c
	ctx=ctx1||c.getContext('2d')
	for(let name in listeners)
		c.addEventListener(name,e=>{
			for(let [ele,fn] of listeners[name])
				if(isTarget(ele,e)){
					fn(e,...canvas.getMousePos(e))
					return
				}
		})
}
function reset(){
	elements.splice(0)
	for(let k in listeners)listeners[k].clear()
}
function render(clear){//按元素创建的顺序渲染
	if(clear)ctx.clearRect(0,0,canvas.width,canvas.height)
	elements.forEach(e=>e.hidden||e.draw())
}

export {CvsEle,init,reset,render,elements}

window.elements=elements