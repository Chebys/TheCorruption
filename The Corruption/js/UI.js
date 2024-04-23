import strings from './strings.js'
import {CvsEle,init as initEle,reset,render,elements} from './cvsEle.js'
import {canvas} from './canvas.js'
import ctrl from './control.js'
import {images} from './assets.js'

initEle(canvas,canvas.getContext('2d'))

const WIDTH=canvas.width
const HEIGHT=canvas.height

const UI_loading={
	construct(){
		reset()
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
		this.startButton=new CvsEle(300,300,600,100,{bgcolor:'#646',font:'40px sans-serif',padding:30})
		this.startButton.text('开始游戏')
		this.editorButton=new CvsEle(300,500,600,100,{bgcolor:'#646',font:'40px sans-serif',padding:30})
		this.editorButton.text('地图编辑器')
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
const borderStyle={border:{width:2,color:'#000'}}
const UI_inGame={
	info:[],
	options:[],
	construct(){
		reset()
		new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'},padding:10}).text('$:100')
		
		this.pauseButton=new CvsEle(1100,0,100,40,{bgcolor:'#420'})
		this.pauseButton.text('暂停')
		this.continueButton=new CvsEle(300,200,600,100,menuStyle)
		this.continueButton.text('继续')
		this.continueButton.hide()
		this.exitButton=new CvsEle(300,300,600,100,menuStyle)
		this.exitButton.text('返回主菜单')
		this.exitButton.hide()
		
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		this.info[0]=new CvsEle(100,bY+20,100,50,borderStyle) //名称
		this.info[1]=new CvsEle(100,bY+80,100,100,borderStyle) //图片
		this.info[2]=new CvsEle(250,bY+20,150,50,borderStyle)
		this.info[3]=new CvsEle(250,bY+70,150,50,borderStyle)
		this.info[4]=new CvsEle(250,bY+120,150,50,borderStyle)
		for(let i=0;i<2;i++)
			for(let j=0;j<4;j++){
				let opt=new CvsEle(500+j*64,bY+40+i*64,64,64,borderStyle)
				opt.on('click',e=>ctrl.option(i*4+j))
				this.options[i*4+j]=opt
			}
	},
	setOnPause(fn){
		this.pauseButton.on('click',()=>{
			fn()
			this.showMenu()
		})
	},
	setOnContinue(fn){
		this.continueButton.on('click',()=>{
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
	clear(){
		for(let e of this.info){
			e.text()
			e.img()
		}
		for(let e of this.options){
			e.text()
			e.img()
		}
	},
	showInfo({info=[],options=[]}){//info为文字数组，options为图片名数组
		this.info.forEach((ele,i)=>ele.text(info[i]))
		this.options.forEach((ele,i)=>ele.img(images[options[i]]))
	},
	showMenu(){
		this.continueButton.show()
		this.exitButton.show()
		render()
	},
	hideMenu(){
		this.continueButton.hide()
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