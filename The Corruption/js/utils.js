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

global('Vector', Vector)