import strings from './strings.js'
import {CvsEle, init as initEle, reset, render, elements} from './cvsEle.js'
import renderMap from './render.js'
import {canvas,ctx} from './canvas.js'
import {loadAssets, images, audios} from './assets.js'

initEle(canvas,ctx)

function toggleFS(){
	return document.fullscreenElement
		?document.exitFullscreen()
		:document.body.requestFullscreen()
}
const FStext=_=>document.fullscreenElement?'退出全屏':'全屏'
const hoverStyle={bgcolor:'#bbb'}

const UI_loading={
	construct(){
		new CvsEle(0,0,WIDTH,HEIGHT,{bgcolor:'#000'})
		this.info=new CvsEle(300,300)
		loadAssets(main.mainMenu, (i,len)=>{
			var t='加载资源：'+i+'/'+len
			this.info.text(t)
		})
	}
}
const UI_mainMenu={
	construct(){
		new CvsEle(0,0,WIDTH,HEIGHT,{bgcolor:'#000'}).img(images['mainmenu'])
		var mainbtstyle={bgcolor:'#640',font:'40px sans-serif',padding:30,radius:20,border:{width:2,color:'#fff'}}
		this.startButton=new CvsEle(300,250,600,100,mainbtstyle)
		this.startButton.text('开始游戏')
		this.startButton.hoverStyle(hoverStyle)
		this.startButton.on('click', main.startGame)
		
		this.editorButton=new CvsEle(300,450,600,100,mainbtstyle)
		this.editorButton.text('地图编辑器')
		this.editorButton.on('click', _=>{
			var l=parseInt(prompt('输入地图边长（建议不超过30）'))
			l&&main.startEditor(l)
		})
		
		this.FSButton=new CvsEle(0,0,120,60,{bgcolor:'#640',font:'30px sans-serif',padding:20})
		this.FSButton.text(FStext)
		this.FSButton.on('click', toggleFS)
		
		render(1)
	}
}
const menuStyle={bgcolor:'#646',border:{width:4,color:'#000'},font:'40px sans-serif',padding:30}
const borderStyle={border:{width:2,color:'#000'},padding:10}
const UI_inGame={
	info:[],
	options:[],
	construct(){
		this.stat_gold=new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'},padding:10})
		
		this.pauseButton=new CvsEle(1100,0,100,40,{bgcolor:'#420',padding:10})
		this.pauseButton.text('暂停')
		this.pauseButton.on('click',_=>{
			//bgmusic.pause()
			TheMap.state='pause'
			this.showMenu()
		})
		
		this.continueButton=new CvsEle(300,150,600,100,menuStyle)
		this.continueButton.text('继续')
		this.continueButton.on('click',_=>{
			//bgmusic.play()
			TheMap.state='in_game'
			this.hideMenu()
		})
		
		this.FSButton=new CvsEle(300,250,600,100,menuStyle)
		this.FSButton.text(FStext)
		this.FSButton.on('click', toggleFS)
		
		this.exitButton=new CvsEle(300,350,600,100,menuStyle)
		this.exitButton.text('返回主菜单')
		this.exitButton.on('click', main.mainMenu)
		
		this.hideMenu()
		
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}}).stopPropagation()
		this.info[0]=new CvsEle(100,bY+20,100,50,borderStyle) //名称
		this.infoImg=new CvsEle(100,bY+80,100,100,borderStyle) //图片
		this.info[1]=new CvsEle(250,bY+20,150,40,borderStyle) //生命值
		this.info[2]=new CvsEle(250,bY+60,150,40,borderStyle)
		this.info[3]=new CvsEle(250,bY+100,150,40,borderStyle)
		this.info[4]=new CvsEle(250,bY+140,150,40,borderStyle)
		for(let i=0;i<2;i++) //选项
			for(let j=0;j<5;j++){
				let opt=new CvsEle(500+j*64,bY+40+i*64,64,64,borderStyle)
				opt.on('click',e=>Ctrl.option(i*5+j))
				this.options[i*5+j]=opt
			}
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
	},
	onPreRender(){
		renderMap()
	},
	onUpdate(){
		var {food, food, gold, stone}=TheMap.stats
		this.stat_gold.text('$:'+gold)
		if(Ctrl.updated){
			if(Ctrl.sel)this.showInfo(Ctrl.getData())
			else this.clearInfo()
			Ctrl.updated=false
		}
	}
}
const UI_editor={
	construct(){
		var bHeight=200,bY=HEIGHT-bHeight //底栏位置
		new CvsEle(0,bY,WIDTH,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		for(let i=0;i<3;i++){
			let tileButton=new CvsEle(100+i*100,bY+50,100,50,borderStyle)
			tileButton.text(strings.tileName[i])
			tileButton.on('click',e=>{
				if(Ctrl.sel){
					Ctrl.sel.tile=i
				}
			})
		}
		var roadButton=new CvsEle(400,bY+50,100,50,borderStyle)
		roadButton.text('道路')
		roadButton.on('click',e=>{
			if(Ctrl.sel){
				Ctrl.sel.road=!Ctrl.sel.road
			}
		})
		var baseButton=new CvsEle(500,bY+50,100,50,borderStyle)
		baseButton.text('基地')
		baseButton.on('click',e=>{
			Ctrl.editorOption('homebase')
		})
		
		this.saveButton=new CvsEle(800,bY+50,100,50,borderStyle)
		this.saveButton.text('保存')
		this.saveButton.on('click',_=>{
			var data=TheMap.export()
			localStorage.setItem('mapData',JSON.stringify(data))
			alert('已保存至localStorage.mapData')
		})
		
		this.exitButton=new CvsEle(900,bY+50,100,50,borderStyle)
		this.exitButton.text('退出')
		this.exitButton.on('click', main.mainMenu)
	},
	onPreRender(){
		renderMap()
	},
}
const screens={
	loading:UI_loading,
	mainMenu:UI_mainMenu,
	inGame:UI_inGame,
	editor:UI_editor
}
const UI={
	goto(name, config){
		var screen=screens[name]
		if(!screen)throw new Error('无'+name)
		reset()
		screen.construct(config)
		this.current=screen
		return screen
	},
	render(){
		this.current.onPreRender?.()
		render()
	},
	update(dt){ //主要操作在事件监听器中完成了
		this.current.onUpdate?.()
	}
}

export default UI