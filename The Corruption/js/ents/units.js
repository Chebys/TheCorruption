import {CD, Unit} from './ents.js'

class Enemy extends Unit{
	static states={default:'Invading'}
	group=2
}
class Corrupter extends Enemy{
	constructor(){
		super(10,1)
	}
	canPass(g1,g2){
		return TheMap.hasRoad(g1,g2)
	}
	onDeath(){
		this.grid.corruption.changeBase(0.01)
		return true
	}
}

export default [Corrupter]