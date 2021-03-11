const Flags = require('./flags');

class Controller{
    constructor(purposes, agent){
        this.purposes = purposes;
        this.purposeIter = 0;
        this.reachPoint = {};

    }
    processEnv(env){
        let playerPos = env.vision.myself;
        let curAct = this.purposes[this.purposeIter].act;
        let objectDistance;
        let objectAngle;
        console.log(env.sense);
        let playerAngle = env.sense.find((elem) => {
            elem.cmd = "turn"
        }).p[0];
        console.log("Player angle = " + playerAngle);

        if (curAct === "flag"){
            this.reachPoint = Flags[this.purposes[this.purposeIter].fl]


            // проверяем видит ли игрок нужный флаг 
            let visibleFlag = env.flags.find((item) => {
                return item.name === this.purposes[this.purposeIter].fl
            })
            if (visibleFlag != undefined){
                // если видит, берем дистанцию до флага и угол из того, что игрок видит 
                objectDistance = visibleFlag.dist
                objectAngle = visibleFlag.angle
            }
            else{
                // если не видит, то расчитываем сами
                objectDistance = Flags.distance(playerPos, this.reachPoint);
                objectAngle = this.calculateAngle;
            }  

        }

        if (distance <= 3){
            if (curAct === "flag"){
                this.purposeIter = (this.purposeIter + 1) % this.purposes.length;
            }
        }
        else {
            this.moveToPoint(objectDistance, objectAngle, playerAngle);
        }
    }
    moveToPoint(objectDistance, objectAngle, playerAngle){
        let resAngle = ((playerAngle - objectAngle) * 180) / Math.PI
        if (resAngle != 0){
            agent.socketSend("turn", resAngle)
        }
    }
    calculateAngle(point1, point2){
        return Math.atan((point1.y - point2.y) / (point1.x - point2.x));
    }
}


module.exports = Controller;