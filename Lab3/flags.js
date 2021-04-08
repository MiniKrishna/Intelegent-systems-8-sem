module.exports = {
	ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
	ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
	ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
	ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
	ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
	ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
	fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
	fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
	fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
	fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
	fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
	flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
	flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
	flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
	flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
	frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
	fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
	frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
	fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
	gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
	fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
	fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
	fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
	fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
	flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
	frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
	goaliePosR: {x: 51, y:0},
	
	distance(f1, f2) {
	    return Math.sqrt((f1.x-f2.x)**2+(f1.y-f2.y)**2)
	},
	
	contains(f) {
	    if (f in this)
	        return true;
	    return false;
	},
	calculateAngle(point1, point2){
    	//console.log(point1);
    	//console.log(point2);
    	let deltaX = point2.x - point1.x;
    	let deltaY = point2.y - point1.y;
    	let angle = Math.atan(deltaY / deltaX) * 180 / Math.PI;
		//console.log(`angle - ${angle} = Math.atan(${deltaY} / ${deltaX}) * 180/ Math.PI`)

    	if (deltaX > 0) {
    		if (deltaY > 0) return angle;
    		else return 360 + angle;
    	}
    	else {
    		return 180 + angle;
    	}
    }
}