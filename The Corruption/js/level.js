var levels = []

var gridData=[
	[[1],[1],[1],[1],[1],[2],[0],[0]],
	[[1],[1],[0],[0],[2],[2],[0],[0]],
	[[1],[0],[0,1],[0],[0],[2],[0],[0]],
	[[1],[0],[0],[0,1],[0],[2],[2],[0]],
	[[0],[0],[0],[0],[0,1],[0,1],[2,1],[0,1]],
	[[0],[1],[0],[0,1],[1,1],[2],[2],[2]],
	[[0],[1],[1],[1,1],[1],[2],[2],[2]]
]
var entData=[
	['homebase',2,2],
	['corrupter',6,3],
	['tower1',4,3],
	['corrupterspawner',6,3],
	['goldmine',1,1],
	['mater',6,2],
]
levels[0] = {ox:CANVAS_WIDTH/2, oy:0, grids:gridData, ents:entData}

const level = {
	num: levels.length,
	get(i){
		return levels[i]
	}
}

export default level