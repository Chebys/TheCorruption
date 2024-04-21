var canvas //应具有getMousePos方法
//元素将按照创建的顺序渲染
//尽量不要为互相遮挡的元素注册相同事件的监听，无法保证顺序
var elements=[]
var listeners={
	mousemove:new Map(),
	click:new Map()
}

class CvsEle{
	constructor(x,y,width,height,style){
		this.path=new Path2D()
		this.path.rect(x,y,width,height)
		elements.push(this)
	}
	on(eventName,fn){
		listeners[eventName].set(this,fn)
	}
}
function isTarget(ele,event){
	return false
}
function init(c){
	canvas=c
	for(let name in listeners)
		c.addEventListener(name,e=>{
			for(let [ele,fn] of listeners[name])
				if(isTarget(ele,e)){
					fn()
					e.stopPropagation()
					return
				}
		})
}