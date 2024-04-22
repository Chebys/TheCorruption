import strings from './strings.js'
import {CvsEle,init as initEle,reset,render} from './cvsEle.js'
import {canvas,ctx} from './canvas.js'
import {images} from './assets.js'

initEle(canvas,ctx)

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
const UI_mainMenu={}
const UI_inGame={
	info:[],
	options:[],
	construct(){
		reset()
		var bHeight=200,bY=canvas.height-bHeight //底栏位置
		new CvsEle(2,2,100,40,{bgcolor:'#420',border:{width:4,color:'#864'}})
		new CvsEle(10,14,0,0,{text:'$:100'})
		new CvsEle(0,bY,canvas.width,bHeight,{bgcolor:'#420',border:{width:10,color:'#864'}})
			.on('mousedown',e=>e.stopImmediatePropagation())
		for(let i=0;i<4;i++)this.info[i]=new CvsEle(i*100+100,bY+50,50,50,{border:{width:2,color:'#000'}})
		for(let i=0;i<4;i++){
			let opt=new CvsEle(600,bY+50+i*50,64,64,{border:{width:2,color:'#000'}})
			opt.on('click',e=>ctrl.option(i))
			this.options[i]=opt
		}
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
	showGrid(g){
		this.info[0].text(strings.tileName[g.tile])
		this.options[1].img(images.default)
	}
}

export {UI_loading,UI_mainMenu,UI_inGame}