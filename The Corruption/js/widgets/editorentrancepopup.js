import {Input} from '/widgets/basewidgets.js'
import Popup from '/widgets/popup.js'

class EditorEntrancePopup extends Popup{
	constructor(){
		super('输入地图边长（建议不超过30）')
		this.AddChild('input', new Input)
		this.input.SetAnchor('center', 'center')
	}
	Confirm(){
		console.log(this.input.value)
		this.Remove()
	}
	Cancel(){
		this.Remove()
	}
}

export default EditorEntrancePopup