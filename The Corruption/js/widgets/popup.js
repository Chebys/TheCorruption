import {Widget, Text, Button} from '/widgets/basewidgets.js'

class Popup extends Widget{
	constructor(titleStr, contentStr, onConfirm, onCancel){
		super(600, 400, {
			border: {width:2, color:'white'},
			radius: 10
		})
		this.onConfirm = onConfirm
		this.onCancel = onCancel
		this.SetAnchor('center', 'center')
		
		var title = this.AddChild(new Text(titleStr, '30px sans-serif'))
		title.SetAnchor('center', 'top')
		title.SetPos(0, 50)
		
		var content = this.AddChild(new Text(contentStr))
		content.SetAnchor('center', 'center')
		content.SetPos(0, 0)
		
		var confirmBtn = this.AddChild(new Button(Strings.ui.confirm, ()=>this.Confirm()))
		confirmBtn.SetAnchor('center', 'bottom')
		confirmBtn.SetPos(-100, -10)
		
		var cancelBtn = this.AddChild(new Button(Strings.ui.cancel, ()=>this.Cancel()))
		cancelBtn.SetAnchor('center', 'bottom')
		cancelBtn.SetPos(100, -10)
	}
	OnNewParent(){
		this.SetPos(0, 0)
	}
	Confirm(){
		this.Remove()
		this.onConfirm()
	}
	Cancel(){
		this.Remove()
		this.onCancel()
	}
}

export default Popup