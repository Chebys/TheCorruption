import strings from './strings.js'
import {CvsEle,init as initEle,reset,render,elements} from './cvsEle.js'
import {canvas,ctx} from './canvas.js'
import ctrl from './control.js'
import {images} from './assets.js'

initEle(canvas,ctx)

const WIDTH=canvas.width
const HEIGHT=canvas.height

function toggleFS(){
	return document.fullscreenElement
		?document.exitFullscreen()
		:document.body.requestFullscreen()
}
var FStext=_=>document.fullscreenElement?'退出全屏':'全屏'

const UI_loading={
	construct(){
		reset()
		new CvsEle(0,0,WIDTH,HEIGHT,{bgcolor:'#000'})
		this.info=new CvsEle(300,300)
	},
	push(t){
		this.info.text(t)
		render(1)
	}
}
const UI_mainMenu={
	construct(){
		reset()
		new CvsEle(0,0,WIDTH,HEIGHT,{bgcolor:'#000'})
		var mainbtstyle={bgcolor:'#646',font:'40px sans-serif',padding:30,radius:20,border:{width:2,color:'#fff'}}
		this.startButton=new CvsEle(300,250,600,100,mainbtstyle)
		this.startButton.text('开始游戏')
		this.editorButton=new CvsEle(300,450,600,100,mainbtstyle)
		this.editorButton.text('地图编辑器')
		this.FSButton=new CvsEle(0,0,120,60,{bgcolor:'#646',font:'30px sans-serif',padding:20})
		this.FSButton.text(FStext)
		this.FSButton.on('click',_=>toggleFS().then(_=>render(1)))
		render(1)
	},
	setOnStartGame(fn){
		this.startButton.on('click',fn)
	},
	setOnEditor(fn){
		this.editorButton.on('click',fn)
	}
}
const menuStyle={bgcolor:'#646',border:{width:4,color:'#000'},font:'40px sans-serif',padding:30}
const borderStyle={border:{width:2,color:'#000'},padding:10}
const UI_inGame={
	info:[],
	options:[],
	construct(){
		reset()
		this.stat_gold=new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'},padding:10})
		
		this.pauseButton=new CvsEle(1100,0,100,40,{bgcolor:'#420',padding:10})
		this.pauseButton.text('暂停')
		
		this.continueButton=new CvsEle(300,150,600,100,menuStyle)
		this.continueButton.text('继续')
		this.FSButton=new CvsEle(300,250,600,100,menuStyle)
		this.FSButton.text(FStext)
		this.FSButton.on('click',_=>toggleFS().then(_=>this.FSButton.draw()))//不能清除之前的画面，麻烦
		this.exitButton=new CvsEle(300,350,600,100,menuStyle)
		this.exitButton.text('返回主菜单')
		this.hideMenu()
		
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		this.info[0]=new CvsEle(100,bY+20,100,50,borderStyle) //名称
		this.infoImg=new CvsEle(100,bY+80,100,100,borderStyle) //图片
		this.info[1]=new CvsEle(250,bY+20,150,40,borderStyle) //生命值
		this.info[2]=new CvsEle(250,bY+60,150,40,borderStyle)
		this.info[3]=new CvsEle(250,bY+100,150,40,borderStyle)
		this.info[4]=new CvsEle(250,bY+140,150,40,borderStyle)
		for(let i=0;i<2;i++)
			for(let j=0;j<5;j++){
				let opt=new CvsEle(500+j*64,bY+40+i*64,64,64,borderStyle)
				opt.on('click',e=>ctrl.option(i*5+j))
				this.options[i*5+j]=opt
			}
	},
	setOnPause(fn){
		this.pauseButton.on('click',_=>{
			fn()
			this.showMenu()
		})
	},
	setOnContinue(fn){
		this.continueButton.on('click',_=>{
			fn()
			this.hideMenu()
		})
	},
	setOnExit(fn){
		this.exitButton.on('click',fn)
	},
	render(){
		render()
	},
	showInfo({info=[],options=[],img:imgName='default'}){//info为文字数组，options为图片名数组
		this.infoImg.img(images[imgName])
		this.info.forEach((ele,i)=>ele.text(info[i]))
		this.options.forEach((ele,i)=>ele.img(images[options[i]]))
	},
	clearInfo(){
		this.infoImg.img()
		for(let e of this.info)e.text()
		for(let e of this.options)e.img()
	},
	pushStats({gold}){
		this.stat_gold.text('$:'+gold)
	},
	showMenu(){
		this.continueButton.show()
		this.FSButton.show()
		this.exitButton.show()
		render()
	},
	hideMenu(){
		this.continueButton.hide()
		this.FSButton.hide()
		this.exitButton.hide()
	}
}
const UI_editor={
	construct(){
		reset()
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		for(let i=0;i<3;i++){
			let tileButton=new CvsEle(100+i*100,bY+50,100,50,borderStyle)
			tileButton.text(strings.tileName[i])
			tileButton.on('click',e=>{
				if(ctrl.sel){
					ctrl.sel.tile=i
					this.onMapChange()
				}
			})
		}
		var roadButton=new CvsEle(400,bY+50,100,50,borderStyle)
		roadButton.text('道路')
		roadButton.on('click',e=>{
			if(ctrl.sel){
				ctrl.sel.road=!ctrl.sel.road
				this.onMapChange()
			}
		})
		var baseButton=new CvsEle(500,bY+50,100,50,borderStyle)
		baseButton.text('基地')
		baseButton.on('click',e=>{
			ctrl.editorOption('homebase')
			this.onMapChange()
		})
		
		this.saveButton=new CvsEle(800,bY+50,100,50,borderStyle)
		this.saveButton.text('保存')
		this.exitButton=new CvsEle(900,bY+50,100,50,borderStyle)
		this.exitButton.text('退出')
		
	},
	setOnMapChange(fn){
		this.onMapChange=fn
	},
	setOnSave(fn){
		this.saveButton.on('click',fn)
	},
	setOnExit(fn){
		this.exitButton.on('click',fn)
	},
	render(){
		render()
	}
}

export {UI_loading,UI_mainMenu,UI_inGame,UI_editor}