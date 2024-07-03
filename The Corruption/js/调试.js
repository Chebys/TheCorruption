pause();
TheMap.findPath(TheMap.grids[1][3],TheMap.grids[6][1]);

var m=spawn('corrupter');
m.toCenter(2,4);
m.moveTo(TheMap.getGrid(6,1));

var s=spawn('homebase');