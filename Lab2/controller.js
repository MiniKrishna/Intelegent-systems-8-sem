const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.curAct = this.purposes[this.purposeIter].act;
        this.reachPoint = {};
        this.agent = agent;
        this.calcAngleManually = false;
    }

    processEnv(env){
        let playerPos = env.vision.myself;
        //console.log
        if (env.vision.myAngle != undefined){
            this.agent.playerAngle = env.vision.myAngle;
            this.calcAngleManually = false;
        }
        else{
            this.calcAngleManually = true;
            console.log("Считаем угол сами")
        }

        console.log(`playerAngle =  ${this.agent.playerAngle}`);

        this.recalculate(env, playerPos);
		console.log(this.objectDistance);
        if (this.objectDistance <= 3){
            if (this.curAct === "flag"){
                console.log("Поменяли цель \n")
                this.nextAct();
                if(env.vision.flags.length < 2){
                    //this.agent.socketSend("turn", "90");
                }
                //this.agent.socketSend("dash", "0");
                //this.processEnv(env);
            }
        }
        else {
        	
            this.moveToPoint();
        }
    }
    
    recalculate(env, playerPos) {
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
                this.angleToResearchPoint = -visibleFlag.angle;
            }
            else { 
                // если не видит, то расчитываем сами
                console.log("Не видим флаг") 

                this.objectDistance = Flags.distance(playerPos, this.reachPoint);
                this.angleToResearchPoint = this.agent.playerAngle - Flags.calculateAngle(playerPos, this.reachPoint);
                console.log("calculatedAngle = " + Flags.calculateAngle(playerPos, this.reachPoint));

                if (Math.abs(this.angleToResearchPoint) > 180) {
                	if (this.angleToResearchPoint < 0)
                		this.angleToResearchPoint =  -(this.angleToResearchPoint + 360)
                	else
                		this.angleToResearchPoint =  (-this.angleToResearchPoint + 360)
                }
                else {
                	this.angleToResearchPoint =  -this.angleToResearchPoint;
                }
            }  
        }
    }

    // переключаемся на следующую цель, обнулив вычисляемые параметры
    nextAct(){
        this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
        this.curAct = this.purposes[this.purposeIter].act;
    }

    // поворачивает игрока в направлении цели
    moveToPoint(){

        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        if (Math.abs(this.angleToResearchPoint) >= 7){
            //console.log("PlayerAngle = " + this.agent.playerAngle)
        	console.log("Вот это папапаварот " + -this.angleToResearchPoint + "\n");
            this.agent.socketSend("turn", -this.angleToResearchPoint);
            if (this.calcAngleManually){
                this.agent.playerAngle += this.angleToResearchPoint;
                this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
                //console.log("Угол игрока ", this.agent.playerAngle);
            }
        }
        else{
            console.log("Вперед \n")
            let vel = 100;
            this.agent.socketSend("dash", `${vel}`);
        }
    }


}


module.exports = Controller;