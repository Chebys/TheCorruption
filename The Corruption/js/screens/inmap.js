import {Screen, Widget, ImageButton, Text, Button} from '/widgets/basewidgets.js'
import renderMap from '/render.js'

class InMap extends Screen{
	constructor(){
		super()
		
		this.AddChild('bottomPanel', new Widget(CANVAS_WIDTH, 200, {bgcolor:'#420', border:{width:10, color:'#864'}}))
		this.bottomPanel.SetAnchor('left', 'bottom')
		this.bottomPanel.SetPos(0, 0)
	}
	OnPreRender(){
		renderMap()
	}
}

export default InMap