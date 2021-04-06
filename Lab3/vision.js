const Flags = require('./flags')

module.exports =  {
    XLimit: 54,
    YLimit: 32,
    calculatePos(gameObjects, oldCoord){
        gameObjects.shift(); // удаляем первый элемент массива (номер такта)
        gameObjects.sort((a,b) => { // сортировка объектов по возрастанию расстояния до них
            return a.p[0] - b.p[0];
        })

        let flagsNearMyself = [];

        let allFlags = [];

        let result = {};

        let players = [];
        gameObjects.forEach(element => {
            // Игроки
            if (element.cmd.p[0] == "p"){
                players.push({dist: element.p, team : element.cmd.p.join('')})
            }
            // мяч
            else if (element.cmd.p[0] == "b"){
                //console.log(element);
                result.ball = element.p;
            }

            let objectName = element.cmd.p.join('');


            if (flagsNearMyself.length == 3)
                return;
            
            if (Flags.contains(objectName)) {

                allFlags.push({name: objectName, dist: element.p[0], angle: element.p[1]}); // все видимые флаги 

                if (flagsNearMyself.length == 3)
                    return;

                flagsNearMyself.push({dist: element.p, pos: Flags[objectName]}) // добавляем в массив ближайших флагов то, что видит игрок и реальные координаты флага
            }
        });

        result.flags = allFlags;
        

        // координаты игрока
        let myselfCoord = this.calculateCoord(flagsNearMyself, oldCoord);

        if(myselfCoord.x === undefined || myselfCoord.y === undefined){
            myselfCoord = oldCoord;
        }

        //console.log("mycoord =  x = " + myselfCoord.x + " y = " +  myselfCoord.y);
        // угол игрока
        result.myAngle = this.calculateAngle(myselfCoord, flagsNearMyself);

        
        //console.log(flagsNearMyself);
        //console.log("myAngle = " + result.myAngle);



        result.players = [];
        // расчет координат игроков
        players.forEach(element => {
            result.players.push({pos: this.calculateObjectCoord(flagsNearMyself, myselfCoord, element.dist), team: element.team})
        });

        result.myself = myselfCoord;

        return result;
    },
    
    calculateMistake(x, x3, y, y3, d3) {
        return Math.abs((x - x3)**2 + (y - y3)**2 - d3**2);
    },

    calculateSameCoord(d1,d2,first, second1, second2, d3, checkFirst, checkSecond, limit, oldCoord){
        let resFirst = (second2**2 - second1**2 + d1**2 - d2**2)/(2*(second2-second1));
        let resSecond_1 = first + Math.sqrt(Math.abs(d1**2 - (resFirst - second1)**2));
        let resSecond_2 = first - Math.sqrt(Math.abs(d1**2 - (resFirst - second1)**2));
        //console.log("resSecond_1 = " + resSecond_1 + " resSecond_2 = " + resSecond_2);
        let resSecond;
        if (Math.abs(resSecond_1) < limit && Math.abs(resSecond_2) > limit ) resSecond = resSecond_1;
        else if (Math.abs(resSecond_1) > limit && Math.abs(resSecond_2) < limit ) resSecond = resSecond_2;
        else{
            let mistake_1 = undefined;
            let mistake_2 = undefined;
            if (d3 !== undefined){
                mistake_1 = this.calculateMistake(resSecond_1, checkSecond, resFirst, checkFirst, d3);
                mistake_2 = this.calculateMistake(resSecond_2, checkSecond, resFirst, checkFirst, d3);
            }

            // choose best

            if (mistake_1 === mistake_2 && oldCoord !== undefined){
                if (limit === this.XLimit){
                    mistake_1 = Flags.distance({x: resSecond_1, y: resFirst}, oldCoord);
                    mistake_2 = Flags.distance({x: resSecond_2, y: resFirst}, oldCoord);
                }
                else{
                    mistake_1 = Flags.distance({x: resFirst, y: resSecond_1}, oldCoord);
                    mistake_2 = Flags.distance({x: resFirst, y: resSecond_2}, oldCoord);
                }
            }
            if (mistake_1 === mistake_2){
                resFirst = undefined;
                resSecond = undefined;
            }
            else if (mistake_1 < mistake_2)
                resSecond = resSecond_1
            else
                resSecond = resSecond_2;
        }
        return [resFirst, resSecond]; 
    },

    calculateObjectCoord(flags, player, object){
        let res = [];
        res.push({dist: object, pos: player});
        let dist_flag1 = flags[0].dist[0];
        let dist_flag2 = flags[1].dist[0];
        let dist_player = object[0];
        let angle_flag1 = (flags[0].dist[1] * Math.PI) /180;
        let angle_flag2 = (flags[1].dist[1]* Math.PI) /180;
        let angle_player = (object[1] * Math.PI) /180;

        let d1 = Math.sqrt(dist_flag1**2 + dist_player**2 - 2*dist_flag1*dist_player*Math.cos(Math.abs(angle_flag1-angle_player)));
        let d2 = Math.sqrt(dist_flag2**2 + dist_player**2 - 2*dist_flag2*dist_player*Math.cos(Math.abs(angle_flag2-angle_player)));

        res.push({dist: [d1], pos: flags[0].pos});
        res.push({dist: [d2], pos: flags[1].pos});
        return this.calculateCoord(res);
    },

    calculateAngle(player, flags){

        if (flags.length == 0){
            return undefined
        }

        let resAngle;
        let flag = undefined;
        

        flags.forEach(element => {
            let deltaX = player.x - element.pos.x;
            let deltaY = player.y - element.pos.y;
            if (Math.abs(deltaX) > 3 && Math.abs(deltaY) > 3){
                flag = element;
            }
        });
        if (flag === undefined){
            flag = flags[0];
        }
        
        let absolutAngle = Flags.calculateAngle(player,flag.pos);
        resAngle = absolutAngle + flag.dist[1];

        //console.log(`resAngle = ${resAngle} = ${absolutAngle} + ${flag.dist[1]}`)
        resAngle = (resAngle % 360 + 360) % 360;

        return resAngle;
    },
    
    calculateCoord(points, oldCoord = undefined){
        let x = undefined;
        let y = undefined;

        let flagsNum = points.length;
        //console.log(`Видим ${flagsNum} флага`);
        if (flagsNum < 2){
            return {x: x, y: y};
        }
        //console.log(points);


        let d3 = undefined
        let y3 = undefined
        let x3 = undefined
        if (flagsNum == 3){
            d3 = points[2].dist[0];
            y3 = points[2].pos.y;
            x3 = points[2].pos.x;
        }
        
        let x1 = points[0].pos.x;
        let x2 = points[1].pos.x;
        let y1 = points[0].pos.y;
        let y2 = points[1].pos.y;
        let d1 = points[0].dist[0];
        let d2 = points[1].dist[0];
 
        
        if (x1 === x2) {
            let coords = this.calculateSameCoord(d1,d2,x1,y1,y2,d3,y3,x3,this.XLimit,oldCoord);

            x = coords[1];
            y = coords[0];
            //console.log("x1 = x2, y = " + y);
        }
        else if (x1 === x3) {
            let coords = this.calculateSameCoord(d1,d3,x1,y1,y3,d2,y2,x2,this.XLimit,oldCoord);

            x = coords[1];
            y = coords[0];
            //console.log("x1 = x3, y = " + y);
        }
        else if (y1 === y2 ) {
            let coords = this.calculateSameCoord(d1,d2,y1,x1,x2,d3,x3,y3,this.YLimit,oldCoord);

            x = coords[0];
            y = coords[1];
            //console.log("y1 = y2, y = " + y);
        }
        else if (y1 === y3) {
            let coords = this.calculateSameCoord(d1,d3,y1,x1,x3,d2,x2,y2,this.YLimit,oldCoord);

            x = coords[0];
            y = coords[1];
            //console.log("y1 = y3, y = " + y);
        }
        else{
            if (flagsNum !== 3) return {x: x, y: y};
            let a1 = (y1 - y2) / (x2 - x1);
            let b1 = (y2**2 - y1**2 + x2**2 - x1**2 + d1**2 - d2**2) / 2 / (x2 - x1);
            let a2 = (y1 - y3) / (x3 - x1);
            let b2 = (y3**2 - y1**2 + x3**2 - x1**2 + d1**2 - d3**2) / 2 / (x3 - x1); 
            y = (b1 - b2) / (a2 - a1);
            x = a1 * y + b1; 
            //console.log("Not sample case, y = " + y);
        }
        
        return {x: x, y: y};
    }
}
