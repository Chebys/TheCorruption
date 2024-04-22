pause();
map.findPath(map.grids[1][3],map.grids[6][1]);

var m=spawn('corrupter');
m.toCenter(2,4);
m.moveTo(map.getGrid(6,1));

var s=spawn('homebase');