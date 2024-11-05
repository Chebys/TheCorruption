import {CvsEle} from '/cvsEle.js'
export default {
	construct({textFn}){
		this.textFn=textFn
		new CvsEle(0, 0, WIDTH, HEIGHT, {bgcolor:'#000'})
		this.info=new CvsEle(300, 300)
	},
	onUpdate(){
		this.info.text(this.textFn())
	}
}