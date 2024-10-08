import {CD, Unit} from './ents.js'

class Enemy extends Unit{
	static states={default:'Invading'}
	group=2
	getAttacked(dmg, attacker){
		super.getAttacked(dmg)
		if(this.isValid && attacker instanceof Unit && this.state.name!='Attacking'){
			//this.setState('Attacking').target(attacker) 需要先保证对方在攻击范围内
		}
	}
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