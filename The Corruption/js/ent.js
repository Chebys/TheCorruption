import ents from './ents/ents.js'
import buildings from './ents/buildings.js'
import units from './ents/units.js'

var prefabs={};
const registerPrefab=C=>{ prefabs[C.name.toLocaleLowerCase()]=C }

ents.forEach(registerPrefab)
buildings.forEach(registerPrefab)
units.forEach(registerPrefab)

function spawn(name=''){
	var C=prefabs[name.toLocaleLowerCase()]
	if(C)return new C()
	throw new Error('不存在名为"'+name+'"的prefab')
}

export {spawn}

//window.prefabs=prefabs
//window.spawn=spawn