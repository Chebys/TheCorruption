//canvas应具有getMousePos方法
//图片暂且依赖 GetImage
var canvas, ctx

var elements=[]
//尽量不要为互相遮挡的元素注册相同事件的监听，无法保证顺序
//重复注册同一元素同一事件则覆盖
const events=['mousemove','mousedown','click']
var listeners={}
var end_listeners={}
var ongoing={}
for(let e of events){
	listeners[e] = new Map
	end_listeners[e] = new Map
	ongoing[e] = new Set
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
	text(t){ //字符串或函数
		this.intext = typeof t=='function' ? t : String(t??'')
	}
	img(name){ //图片将缩放为与元素大小相同
		this.image=name&&GetImage(name)
	}
	draw(){
		if(this.style.bgcolor){
			ctx.fillStyle=this.style.bgcolor
			ctx.fill(this.path)
		}
		if(this.image){
			var w=this.x2-this.x1, h=this.y2-this.y1
			ctx.drawImage(this.image, this.x1, this.y1, w, h)
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
			let x, y=this.y1+pd
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
			let t=this.intext
			ctx.fillText(typeof t=='function'?t():t, x, y)
		}
	}
	on(eventName, fn, end_fn){
		//触发时，调用fn(event,x,y)
		//下一次canvas触发该事件但该元素不是目标时，调用end_fn(event,x,y)
		//不允许只有end_fn
		listeners[eventName].set(this,fn)
		end_fn&&end_listeners[eventName].set(this,end_fn)
	}
	hoverStyle(style){
		var _style=this.style
		var hoverStyle=Object.create(_style)
		DeepCopy(style, hoverStyle)
		this.on('mousemove', _=>{this.style=hoverStyle}, _=>{this.style=_style})
	}
	activeStyle(){
		
	}
	stopPropagation(){
		//防止点击穿透
		//只会阻止直接通过addEventListener添加到canvas的监听器，如地图点击
		this.on('mousedown', e=>e.stopImmediatePropagation())
	}
}
function isTarget(ele,e){
	if(ele.hidden)return false
	var [x,y]=canvas.getMousePos(e)
	if(ele.x1<=x&&x<=ele.x2&&ele.y1<=y&&y<=ele.y2)
		return true
}

function init(c, ctx1){
	if(!c.getMousePos)throw new Error('canvas 应实现 getMousePos 方法')
	canvas = c
	ctx = ctx1||c.getContext('2d')
	for(let name of events)
		c.addEventListener(name, e=>{
			for(let [ele,fn] of listeners[name])
				if(isTarget(ele,e)){
					fn(e, ...canvas.getMousePos(e))
					ongoing[name].add(ele)
				}else if(ongoing[name].has(ele)){
					ongoing[name].delete(ele)
					end_listeners[name].get(ele)?.(e, ...canvas.getMousePos(e))
				}
		})
}
function reset(){
	elements.splice(0)
	for(let e of events){
		listeners[e].clear()
		end_listeners[e].clear()
		ongoing[e].clear()
	}
}
function render(clear){//按元素创建的顺序渲染
	if(clear)ctx.clearRect(0, 0, canvas.width, canvas.height)
	elements.forEach(e=>e.hidden||e.draw())
}

export {CvsEle, init, reset, render, elements}

global('elements', elements) //debug