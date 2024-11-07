//依赖 GetImage
//依赖 Array.prototype.remove
var canvas, ctx

var elements = []

const events = ['mousemove','mousedown','click']

var defaultFont = '20px sans-serif'
var defaultcolor = '#fff'
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
	//x1, x2, y1, y2
	listener = {}
	end_listener = {}
	currentEvents = new Set
	constructor(x, y, width=0, height=0, style={}){ //会随style的变化而同步变化（除了radius需要refreshPath）
		this.style=style
		this.setPos(x, y, x+width, y+height) //顺便refreshPath
		elements.push(this)
	}
	refreshPath(){
		this.path=new Path2D
		var {x1, y1, x2, y2, style:{radius}} = this
		if(radius)this.path.roundRect(x1, y1, x2-x1, y2-y1, radius)
		else this.path.rect(x1, y1, x2-x1, y2-y1)
	}
	hide(){
		this.hidden=true
	}
	show(){
		this.hidden=false
	}
	setPos(x1, y1, x2, y2){
		Object.assign(this, {x1, y1, x2, y2})
		this.refreshPath()
	}
	text(t){ //字符串或函数
		this.intext = typeof t=='function' ? t : String(t??'')
	}
	img(image){ //图片将缩放为与元素大小相同
		this.image=image
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
		//重复注册同一事件则覆盖
		//后创建的元素先触发事件
		//触发时，调用fn(event,x,y)
		//fn返回真值时，事件停止传播
		//下一次canvas触发该事件但该元素不是目标时，调用end_fn()
		//不允许只有end_fn
		this.listener[eventName] = fn
		this.end_listener[eventName] = end_fn
	}
	/* stopClickPropagation(){
		this.on('mousedown', e=>true)
	} */
	remove(){
		elements.remove(this)
		this.invalid = true
	}
}
function isTarget(ele, x, y){
	if(ele.hidden||ele.invalid)return false
	if(ele.x1<=x&&x<=ele.x2&&ele.y1<=y&&y<=ele.y2)
		return true
}

function init(c, ctx1){
	if(!c.getMousePos)throw new Error('canvas 应实现 getMousePos 方法')
	canvas = c
	ctx = ctx1||c.getContext('2d')
	for(let name of events)
		c.addEventListener(name, e=>{
			var propagating = true
			var list = elements.slice() //elements可能变动
			var [x, y] = canvas.getMousePos(e)
			for(let i=list.length-1; i>=0; i--){
				let ele=list[i]
				if(!ele)continue //可能已被移除
				if(isTarget(ele, x, y)){
					if(propagating){
						ele.currentEvents.add(name)
						propagating = !(ele.listener[name]?.(e, x, y))
					}
				}else if(ele.currentEvents.has(name)){
					ele.currentEvents.delete(name)
					ele.end_listener[name]?.()
				}
			}
			if(!propagating)e.stopImmediatePropagation()
		})
}
function reset(){
	elements.splice(0)
}
function render(clear){ //按元素创建的顺序渲染
	if(clear)ctx.clearRect(0, 0, canvas.width, canvas.height)
	elements.forEach(e=>e.hidden||e.draw())
}

export {CvsEle, init, reset, render, elements}

global('elements', elements) //debug