import {CvsEle} from './cvsEle.js'

const FStext=_=>document.fullscreenElement?'退出全屏':'全屏'
const hoverStyle={bgcolor:'#a74'}

export default {
	construct(){
		new CvsEle(0,0,WIDTH,HEIGHT,{bgcolor:'#000'}).img('mainmenu')
		var mainbtstyle={bgcolor:'#640',font:'40px sans-serif',padding:30,radius:20,border:{width:2,color:'#fff'}}
		this.startButton=new CvsEle(300,250,600,100,mainbtstyle)
		this.startButton.text('开始游戏')
		this.startButton.hoverStyle(hoverStyle)
		this.startButton.on('click', main.startGame)
		
		this.editorButton=new CvsEle(300,450,600,100,mainbtstyle)
		this.editorButton.text('地图编辑器')
		this.editorButton.hoverStyle(hoverStyle)
		this.editorButton.on('click', _=>{
			var l=parseInt(prompt('输入地图边长（建议不超过30）'))
			l&&main.startEditor(l)
		})
		
		this.FSButton=new CvsEle(0,0,120,60,{bgcolor:'#640',font:'30px sans-serif',padding:20})
		this.FSButton.text(FStext)
		this.FSButton.on('click', ToggleFS)
		this.FSButton.hoverStyle(hoverStyle)
	}
}