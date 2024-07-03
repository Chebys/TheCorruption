import log1 from './1.js'
import './3.js'
console.log('global')

export default 'globalexport'
log1()

function global(name, val){
	if(globalThis[name]!==undefined)console.warn(`Global variable "${name}" already exist!`)
	globalThis[name]=val
}

global('global', global)
global('WIDTH', 1200)
global('HEIGHT', 800)
