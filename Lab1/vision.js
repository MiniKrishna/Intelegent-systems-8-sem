const Flags = {
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
	fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
	
	distance(f1, f2) {
	    return Math.sqrt((f1.x-f2.x)**2+(f1.y-f2.y)**2)
	},
	
	contains(f) {
	    if (f in Flags)
	        return true;
	    return false;
	},
}

module.exports =  {
    calculatePos(gameObjects){
        gameObjects.shift(); // удаляем первый элемент массива (номер такта)
        //console.log(gameObjects);
        gameObjects.sort((a,b) => { // сортировка объектов по возрастанию расстояния до них
            return a.p[0] - b.p[0];
        })
        //console.log(gameObjects);
        let flagsNearPlayer = [];
        gameObjects.forEach(element => {
            if (flagsNearPlayer.length == 3) {
                return;
            }
            let objectName = element.cmd.p.join('');
            if (Flags.contains(objectName)) {
                flagsNearPlayer.push({dist: element.p, pos: Flags[objectName]}) // добавляем в массив ближайших флагов то, что видит игрок и реальные координаты флага
            }
            //console.log(objectName);

        });
        let playerCoord = this.calculateCoord(flagsNearPlayer);
        console.log(playerCoord[0], playerCoord[1]);
        return {player: playerCoord};
    },
    
    calculateMistake(x, x3, y, y3, d3) {
        return Math.abs((x - x3)**2 + (y - y3)**2 - d3**2);
    },
    
    calculateCoord(points){
        let x = 0;
        let y = 0;
        console.log(points.length);
        if (points.length === 3) {
            let x1 = points[0].pos.x;
            let x2 = points[1].pos.x;
            let x3 = points[2].pos.x;
            let y1 = points[0].pos.y;
            let y2 = points[1].pos.y;
            let y3 = points[2].pos.y;
            let d1 = points[0].dist[0];
            let d2 = points[1].dist[0];
            let d3 = points[2].dist[0];
            
            if (x1 === x2) {
                y = ((d1**2 - d2**2) / (y2 - y1) + y1 + y2) / 2;
                let xx1 = x1 + Math.sqrt(d1**2 - (y - y1)**2);
                let xx2 = x1 - Math.sqrt(d1**2 - (y - y1)**2);
                if (Math.abs(xx1) < 54 && Math.abs(xx2) < 54) {
                	// choose best
                	if (this.calculateMistake(xx1, x3, y, y3, d3) < this.calculateMistake(xx2, x3, y, y3, d3))
                	    x = xx1;
                	else
                	    x = xx2;
                } 
                else if (Math.abs(xx1) < 54) x = xx1;
                else x = xx2;
                console.log("x1 == x2", "xx1 = ", xx1, "xx2 = ", xx2);
;            }
            else if (x1 === x3) {
                y = ((d1**2 - d3**2) / (y3 - y1) + y1 + y3) / 2;
                let xx1 = x1 + Math.sqrt(d1**2 - (y - y1)**2);
                let xx2 = x1 - Math.sqrt(d1**2 - (y - y1)**2);
                if (Math.abs(xx1) < 54 && Math.abs(xx2) < 54) {
                	// choose best
                	if (this.calculateMistake(xx1, x3, y, y3, d3) < this.calculateMistake(xx2, x3, y, y3, d3))
                	    x = xx1;
                	else
                	    x = xx2;
                } 
                else if (Math.abs(xx1) < 54) x = xx1;
                else x = xx3;
                console.log("x1 == x3", "xx1 = ", xx1, "xx2 = ", xx2);
            }
            else if (y1 === y2) {
                x = ((d1**2 - d2**2) / (x2 - x1) + x1 + x2) / 2;
                let yy1 = y1 + Math.sqrt(d1**2 - (x - x1)**2);
                let yy2 = y1 - Math.sqrt(d1**2 - (x - x1)**2);
                if (Math.abs(yy1) < 32 && Math.abs(yy2) < 32) {
                	// choose best
                	if (this.calculateMistake(x, x3, yy1, y3, d3) < this.calculateMistake(x, x3, yy1, y3, d3))
                	    y = yy1;
                	else
                	    y = yy2;
                } 
                else if (Math.abs(yy1) < 32) y = yy1;
                else y = yy2;
                console.log("y1 == y2", "y1 = ", yy1, "yy2 = ", yy2);
            }
            else if (y1 === y3) {
		 x = ((d1**2 - d3**2) / (x3 - x1) + x1 + x3) / 2;
                let yy1 = y1 + Math.sqrt(d1**2 - (x - x1)**2);
                let yy2 = y1 - Math.sqrt(d1**2 - (x - x1)**2);
                if (Math.abs(yy1) < 32 && Math.abs(yy2) < 32) {
                	// choose best
                	if (this.calculateMistake(x, x3, yy1, y3, d3) < this.calculateMistake(x, x3, yy1, y3, d3))
                	    y = yy1;
                	else
                	    y = yy2;
                } 
                else if (Math.abs(yy1) < 32) y = yy1;
                else y = yy2;
                console.log("y1 == y3", "yy1 = ", y1, "yy2 = ", yy2);
            }
            else {
                let a1 = (y1 - y2) / (x2 - x1);
                let b1 = (y2**2 - y1**2 + x2**2 - x1**2 + d1**2 - d2**2) / 2 / (x2 - x1);
                let a2 = (y1 - y3) / (x3 - x1);
                let b2 = (y3**2 - y1**2 + x3**2 - x1**2 + d1**2 - d3**2) / 2 / (x3 - x1); 
                console.log(a1, b1, a2, b2);
                y = (b1 - b2) / (a2 - a1);
                x = a1 * y + b1; 
            }
        }
        else if (points.length === 2) {
		
        }
        return [x, y];
    }
}
