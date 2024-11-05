import {CvsEle} from './cvsEle.js'

const FStext=_=>document.fullscreenElement?'退出全屏':'全屏'
const hoverStyle={bgcolor:'#bbb'}

const menuStyle={bgcolor:'#646',border:{width:4,color:'#000'},font:'40px sans-serif',padding:30}
const borderStyle={border:{width:2,color:'#000'},padding:10}

export default {
	construct({renderMap}){
		this.onPreRender=renderMap
		
		this.info=[]
		this.options=[]
		
		this.stat_gold=new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'},padding:10})
		
		this.pauseButton=new CvsEle(1100,0,100,40,{bgcolor:'#420',padding:10})
		this.pauseButton.text('暂停')
		this.pauseButton.on('click',_=>{
			//bgmusic.pause()
			TheMap.state='pause'
			main.removeMapHandler()
			this.showMenu()
		})
		
		this.continueButton=new CvsEle(300,150,600,100,menuStyle)
		this.continueButton.text('继续')
		this.continueButton.on('click',_=>{
			//bgmusic.play()
			TheMap.state='in_game'
			main.addMapHandler()
			this.hideMenu()
		})
		
		this.FSButton=new CvsEle(300,250,600,100,menuStyle)
		this.FSButton.text(FStext)
		this.FSButton.on('click', ToggleFS)
		
		this.exitButton=new CvsEle(300,350,600,100,menuStyle)
		this.exitButton.text('返回主菜单')
		this.exitButton.on('click', main.mainMenu)
		
		this.hideMenu()
		
		var bHeight=200, bY=HEIGHT-bHeight //底栏位置
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
	showInfo({info=[], options=[], img:imgName='default'}){//info为文字数组，options为图片名数组
		this.infoImg.img(imgName)
		this.info.forEach((ele,i)=>ele.text(info[i]))
		this.options.forEach((ele,i)=>ele.img(options[i]))
	},
	clearInfo(){
		this.infoImg.img()
		for(let e of this.info)e.text()
		for(let e of this.options)e.img()
	},
	popup(title){
		console.log(title) //todo
	},
	showMenu(){
		this.continueButton.show()
		this.FSButton.show()
		this.exitButton.show()
	},
	hideMenu(){
		this.continueButton.hide()
		this.FSButton.hide()
		this.exitButton.hide()
	},
	onPreRender(){}, //在construct中赋值
	onUpdate(){
		if(TheMap.state=='lose_pending'){
			this.popup('输！')
			return
		}else if(TheMap.state=='win_pending'){
			this.popup('赢！')
			return
		}
		let {food, wood, gold, stone}=TheMap.stats
		this.stat_gold.text('$:'+gold)
		if(Ctrl.updated){
			if(Ctrl.sel)this.showInfo(Ctrl.getData())
			else this.clearInfo()
			Ctrl.updated=false
		}
	}
}