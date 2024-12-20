class Vector{
	constructor(x, y, z){
		this.set(x, y, z)
	}
	delta(dx=0, dy=0, dz=0){
		this.x += dx
		this.y += dy
		this.z += dz
	}
	set(x=0, y=0, z=0){
		Object.assign(this, {x,y,z})
	}
}

Array.prototype.remove = function(item){ //移除第一次出现的元素
	var i = this.indexOf(item)
	if(i<0)return false
	this.splice(i, 1)
	return true
}


global('Vector', Vector)
global('Dict', obj => Object.assign(Object.create(null), obj))