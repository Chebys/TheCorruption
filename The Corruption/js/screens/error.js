import {Screen, Text} from '/widgets/basewidgets.js'

class Error extends Screen{
	constructor({error}){
		super()
		this.SetStyle({bgcolor:'#000'})
		
		var title = this.AddChild(new Text(Strings.ui.error_occurred, '30px sans-serif'))
		title.SetAnchor('center', 'top')
		title.SetPos(0, 100)
		
		var msg = this.AddChild(new Text(error ?? Strings.ui.unknown_error))
		msg.SetAnchor('center', 'center')
		msg.SetPos()
	}
}

export default Error