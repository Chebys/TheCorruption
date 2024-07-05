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

global('global', global)
global('DeepCopy', DeepCopy)

global('WIDTH', 1200)
global('HEIGHT', 800)
