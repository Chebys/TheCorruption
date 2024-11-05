import {CvsEle} from './cvsEle.js'
export default {
	construct({error}){
		new CvsEle(0, 0, WIDTH, HEIGHT, {bgcolor:'#000'})
		new CvsEle(WIDTH/2, 100, 0, 0, {font:'30px sans-serif'}).text('发生了错误：')
		new CvsEle(WIDTH/2, 300).text(error)
	}
}