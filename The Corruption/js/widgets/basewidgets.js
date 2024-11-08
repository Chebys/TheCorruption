import {CvsEle} from '/cvsEle.js'

const anchors = Dict({
	left: 0,
	top: 0,
	center: 0.5,
	right: 1,
	bottom: 1
})
function resolveKeyword(key){
	if(typeof key=='number')return key
	return anchors[key] || 0
}

//大部分基本组件在实例化后需手动 SetAbsPos（SetPos）；任何布局的改变也需要SetAbsPos才能生效（暂且如此）
//原则上，只有基本组件可以直接访问_开头的属性
class Widget{
	children = new Set
	parent = null
	style = {}
	hoverStyle = Object.create(this.style)
	_e = new CvsEle(0, 0, 0, 0, this.style)
	constructor(width=0, height=0, style){ //style语法见cvsEle.js；style会被深拷贝
		this.SetStyle(style)
		this.SetAnchor('left', 'top')
		this.SetSize(width, height)
		this._e.on('mousedown', ()=>this._able&&this.OnMouseDown())
		this._e.on('click', ()=>this._able&&this.OnClick())
		this._e.on('mousemove', ()=>this._able&&this.OnMouseMove(), ()=>this.OnMouseOut())
		this.Enable(true)
	}
	//所有方法首字母大写
	SetStyle(style){ //不会删除已有属性
		DeepCopy(style, this.style) //cvsEle的style为引用，会同步变化
	}
	SetHoverStyle(style){
		DeepCopy(style, this.hoverStyle)
	}
	SetSize(width, height){
		this.width=width
		this.height=height
	}
	SetAbsPos(x1, y1, x2, y2){
		//SetAbsPos(x1, y1) 根据宽高自动推断x2 y2
		//SetAbsPos(x1, y1, x2, y2) 同时设置宽高
		if(x2==undefined){
			x2 = x1+this.width
			y2 = y1+this.height
		}else{
			this.width = x2-x1
			this.height = y2-y1
		}
		this._e.setPos(x1, y1, x2, y2)
	}
	SetAnchor(h, v){ //顺便 SetPivot
		this.hAnchor = resolveKeyword(h)
		this.vAnchor = resolveKeyword(v)
		this.SetPivot(h, v)
	}
	SetPivot(h, v){ //往往和Anchor一样
		this.hPivot = resolveKeyword(h)
		this.vPivot = resolveKeyword(v)
	}
	GetAnchorPos({hAnchor, vAnchor}){ //由子组件调用
		var {x1, y1} = this._e
		return [x1 + this.width*hAnchor, y1 + this.height*vAnchor]
	}
	SetPos(x, y){ //省略参数表示仅刷新
		if(x==undefined){
			x = this.x || 0
			y = this.y || 0
		}else{
			this.x = x
			this.y = y
		}
		var [x0, y0] = this.parent?.GetAnchorPos(this) || [0, 0]
		var [offsetX, offsetY] = [this.width*this.hPivot, this.height*this.vPivot]
		this.SetAbsPos(x0+x-offsetX, y0+y-offsetY)
		for(let child of this.children)child.SetPos()
	}
	AddChild(name, widget){ //或AddChild(widget)
		if(name instanceof Widget) widget = name
		else this[name] = widget
		this.children.add(widget)
		widget.SetParent(this)
		return widget
	}
	SetParent(widget){ //通常不需要主动调用
		this.parent = widget
		this.OnNewParent(widget)
	}
	Enable(able){ //影响监听器
		this._able = able
	}
	Hide(){
		this.Enable(false)
		for(let child of this.children)child.Hide()
		this._e.hide()
	}
	Show(){
		this.Enable(true)
		for(let child of this.children)child.Show()
		this._e.show()
	}
	SetImage(name){
		this._e.img(name&&GetImage(name))
	}
	RemoveChild(widget){
		this.children.delete(widget)
	}
	Remove(){
		for(let child of this.children)child.Remove()
		this.parent?.RemoveChild(this)
		this._e.remove()
	}
	//以下方法可重写
	OnNewParent(widget){} //可以重写此方法来自动定位
	OnMouseDown(){
		return true //捕获
	}
	OnClick(){
		return true //捕获
	}
	OnMouseMove(){
		if(!this._focus){
			this._focus = true
			this.OnMouseIn()
		}
		return true //捕获
	}
	OnMouseIn(){
		this._e.style = this.hoverStyle
	}
	OnMouseOut(){
		this._focus = false
		this._e.style = this.style
	}
}

class ImageButton extends Widget{
	constructor(imagename, callback=nullfn, width, height){
		super(width, height)
		this.SetImage(imagename)
		this._cb = callback
	}
	OnClick(){
		this._cb()
		return true
	}
}

class Text extends Widget{
	constructor(str, font){
		super(0, 0, {font})
		this.SetText(str)
	}
	SetText(str){
		this._e.text(str)
	}
}

const default_btn_style = {padding:10, radius:5, bgcolor:'purple'}
class Button extends Text{
	constructor(text, callback=nullfn, width=100, height=40){
		super(text)
		this._cb = callback
		this.SetSize(width, height)
		this.SetStyle(default_btn_style)
		this.SetHoverStyle({bgcolor:'#a6a'})
	}
	OnClick(){
		this._cb()
		return true
	}
}


//Screen为根组件，需要在UI.js中注册，一次只能有一个Screen实例
class Screen extends Widget{
	constructor(){
		super(CANVAS_WIDTH, CANVAS_HEIGHT)
		this.SetAbsPos(0, 0)
	}
	OnMouseDown(){
		super.OnMouseDown()
		//不捕获，以处理地图点击等
	}
	OnMouseMove(){
		super.OnMouseMove()
	}
	//以下方法由UI调用；用于重写
	OnUpdate(){}
	OnPreRender(){}
}

export {Widget, ImageButton, Text, Button, Screen}