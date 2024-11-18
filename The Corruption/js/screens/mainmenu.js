import {Screen, Button} from '/widgets/basewidgets.js'
import EditorEntrancePopup from '/widgets/editorentrancepopup.js'

const FStext = _=>document.fullscreenElement?'退出全屏':'全屏'
const hoverStyle = {bgcolor:'#a74'}

class MainMenu extends Screen{
	constructor(){
		super()
		this.SetImage('mainmenu')
		//bg.on('click', ()=>UI.playBGMusic('bg'))
		var mainbtstyle = {bgcolor:'#640', font:'40px sans-serif', padding:30, radius:20, border:{width:2, color:'#fff'}}
		
		var startButton = this.AddChild(new Button('开始游戏', main.startGame, 600, 100))
		startButton.SetStyle(mainbtstyle)
		startButton.SetHoverStyle(hoverStyle)
		startButton.SetAnchor('center', 'center')
		startButton.SetPos(0, -150)
		
		var editorButton = this.AddChild(new Button('地图编辑器', ()=>this.AddChild(new EditorEntrancePopup), 600, 100))
		editorButton.SetStyle(mainbtstyle)
		editorButton.SetHoverStyle(hoverStyle)
		editorButton.SetAnchor('center', 'center')
		editorButton.SetPos(0, 150)
		
		var FSButton = this.AddChild(new Button(FStext, ToggleFS, 120, 60))
		FSButton.SetStyle({font:'30px sans-serif', padding:20})
		FSButton.SetAnchor('right', 'top')
		FSButton.SetPos(0, 0)
	}
	/* StartEditor(){
		var l = parseInt(prompt('输入地图边长（建议不超过30）'))
		l && main.startEditor(l)
	} */
}

export default MainMenu