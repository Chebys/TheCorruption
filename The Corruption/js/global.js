function global(name, val){
	if(name in globalThis)console.warn(`Global variable "${name}" already exist!`)
	globalThis[name]=val
}
function DeepCopy(obj, tar){
	if(typeof obj!='object')return obj
	tar=tar||{}
	for(let k in obj)tar[k]=DeepCopy(obj[k])
	return tar
}
var sel
function c_sel(tar){
	sel=tar??sel
	console.log('c_sel', sel)
	return sel
}

global('global', global)
global('DeepCopy', DeepCopy)
global('c_sel', c_sel)

global('WIDTH', 1200)
global('HEIGHT', 800)
