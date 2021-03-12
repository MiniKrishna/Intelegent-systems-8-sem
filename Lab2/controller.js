const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reachPoint = {};
        this.agent = agent;
 		this.reset();

        console.log("A = " + this.calculateAngle({x: 0, y: 0}, {x: 50, y: 30}));
        console.log("B = " + this.calculateAngle({x: 0, y: 0}, {x: 50, y: -30}));
        console.log("C = " + this.calculateAngle({x: 0, y: 0}, {x: -50, y: -30}));
        console.log("D = " + this.calculateAngle({x: 0, y: 0}, {x: -50, y: 30}));
    }

    processEnv(env){
        let playerPos = env.vision.myself;
        let playerAngle = env.sense.find((elem) => {
             return elem.cmd === "speed";
        }).p[1];
        //console.log("Player angle = " + playerAngle);
        
        this.recalculate(env, playerAngle, playerPos);

        if (this.objectDistance <= 3){
            if (curAct === "flag"){
                this.nextAct();
                this.agent.socketSend("dash", "-100");
                this.processEnv(env);
            }
        }
        else {
            this.moveToPoint();
        }
    }
    
    recalculate(env, playerAngle, playerPos) {
    	if (this.curAct === "flag"){
            this.reachPoint = Flags[this.purposes[this.purposeIter].fl];

            // проверяем видит ли игрок нужный флаг 
            let visibleFlag = env.vision.flags.find((item) => {
                return item.name === this.purposes[this.purposeIter].fl;
            })
            if (visibleFlag != undefined){
                // если видит, берем дистанцию до флага и угол из того, что игрок видит
                console.log("Видим флаг") 
                this.objectDistance = visibleFlag.dist;
                this.angleToResearchPoint = visibleFlag.angle;
            }
            else { 
                // если не видит, то расчитываем сами
                console.log("Не видим флаг") 
                console.log("Угол игрока = " + playerAngle );
                console.log("Угол объекта = " + this.calculateAngle(playerPos, this.reachPoint));
                this.objectDistance = Flags.distance(playerPos, this.reachPoint);
                this.angleToResearchPoint = playerAngle - this.calculateAngle(playerPos, this.reachPoint);
            }  
        }
    }

    reset(){
        this.angleToResearchPoint = undefined;
        this.objectDistance = undefined;
    }
    
    // переключаемся на следующую цель, обнулив вычисляемые параметры
    nextAct(){
        this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reset();
    }

    // поворачивает игрока в направлении цели
    moveToPoint(){
        //console.log("objectDistance = " + this.objectDistance)
        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        if (this.angleToResearchPoint >= 3){
            this.agent.socketSend("turn", this.angleToResearchPoint);
            console.log("Повернули на angleToResearchPoint = " + this.angleToResearchPoint + "\n");
        }
        else{
            console.log("Вперед \n")
            this.agent.socketSend("dash", "100");
        }
    }

    // возвращает угол в градусах между двумя точками
    calculateAngle(point1, point2){
        //console.log("point1 = " + point1);
        //console.log("point2 = " + point2)
        return Math.atan((point1.y - point2.y) / (point1.x - point2.x)) * 180 / Math.PI;
    }
}


module.exports = Controller;