import {Screen, Widget, ImageButton, Text, Button} from '/widgets/basewidgets.js'
import CenterMenu from '/widgets/centermenu.js'
import renderMap from '/render.js'

const FStext = _=>document.fullscreenElement?'退出全屏':'全屏'

const menuStyle = {bgcolor:'#646',border:{width:4,color:'#000'},font:'40px sans-serif',padding:30}
const borderStyle = {border:{width:2,color:'#000'},padding:10}

class InGame extends Screen{
	constructor(){
		super()
		
		this.info = []
		this.options = []
		
		this.AddChild('stat_gold', new Text)
		this.stat_gold.SetStyle({bgcolor:'#420',border:{width:4,color:'#864'},padding:10})
		this.stat_gold.SetAbsPos(2, 2, 100, 40)
		
		this.AddChild('pauseButton', new Button('暂停', ()=>this.Pause()))
		this.pauseButton.SetStyle({bgcolor:'#420', padding:10})
		this.pauseButton.SetAnchor('right', 'top')
		this.pauseButton.SetPos(0, 0)
		
		var menu_items = [
			{text:'继续', cb:()=>this.Continue()},
			{text:FStext, cb:ToggleFS},
			{text:'返回主菜单', cb:main.mainMenu}
		]
		
		this.AddChild('menu', new CenterMenu(menu_items))
		this.menu.Hide()
		
		this.AddChild('bottomPanel', new Widget(CANVAS_WIDTH, 200, {bgcolor:'#420', border:{width:10, color:'#864'}}))
		this.bottomPanel.SetAnchor('left', 'bottom')
		this.bottomPanel.SetPos(0, 0)
		
		this.infoImg = this.bottomPanel.AddChild(new Widget(100, 100, borderStyle)) //图片
		this.infoImg.SetPos(100, 80)
		
		this.MakeInfo(0, 100, 20, 100, 50) //名称
		this.MakeInfo(1, 250, 20, 150, 40) //生命值
		this.MakeInfo(2, 250, 60, 150, 40)
		this.MakeInfo(3, 250, 100, 150, 40)
		this.MakeInfo(4, 250, 140, 150, 40)
		
		for(let i=0; i<2; i++) //选项
			for(let j=0; j<5; j++){
				let opt = this.bottomPanel.AddChild(new ImageButton(null, ()=>Ctrl.option(i*5 + j), 64, 64))
				opt.SetStyle(borderStyle)
				opt.SetPos(500 + j*64, 40 + i*64)
				this.options[i*5 + j] = opt
			}
	}
	MakeInfo(index, x, y, width, height){
		this.info[index] = this.bottomPanel.AddChild(new Text)
		this.info[index].SetStyle(borderStyle)
		this.info[index].SetSize(width, height)
		this.info[index].SetPos(x, y)
	}
	ShowInfo({info=[], options=[], img:imgName='default'}){//info为文字数组，options为图片名数组
		this.infoImg.SetImage(imgName)
		this.info.forEach((ele,i)=>ele.SetText(info[i]))
		this.options.forEach((ele,i)=>ele.SetImage(options[i]))
	}
	ClearInfo(){
		this.infoImg.SetImage()
		for(let e of this.info)e.SetText()
		for(let e of this.options)e.SetImage()
	}
	Pause(){
		//bgmusic.pause()
		TheMap.state='pause'
		main.removeMapHandler()
		this.menu.Show()
	}
	Continue(){
		//bgmusic.play()
		TheMap.state='in_game'
		main.addMapHandler()
		this.menu.Hide()
	}
	Popup(title){
		console.log(title) //todo
	}
	OnPreRender(){
		renderMap()
	}
	OnUpdate(){
		if(TheMap.state=='lose_pending'){
			this.Popup('输！')
			return
		}else if(TheMap.state=='win_pending'){
			this.Popup('赢！')
			return
		}
		let {food, wood, gold, stone} = TheMap.stats
		this.stat_gold.SetText('$:'+gold)
		if(Ctrl.updated){
			if(Ctrl.sel)this.ShowInfo(Ctrl.getData())
			else this.ClearInfo()
			Ctrl.updated=false
		}
	}
}

export default InGame