function global(name, val){
	if(name in globalThis)console.warn(`Global variable "${name}" already exist!`)
	globalThis[name]=val
}

global('global', global)
global('WIDTH', 1200)
global('HEIGHT', 800)
