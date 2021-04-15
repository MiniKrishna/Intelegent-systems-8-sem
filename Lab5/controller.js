const Manager = require('./autoMgr')
const Automates = require('./automates')
const Flags = require('./flags');

class Controller{
    constructor(agent){
        this.agent = agent;
        this.calcAngleManually = false;
        this.seeRes = {};
        this.ta = Automates.PlayerTA;
    }

    processEnv(env){
        this.env = env;

        //if (this.agent.goalie == false) return;
        ///console.log(env.vision.myAngle);

        if (env.vision.myAngle != undefined){
            this.agent.playerAngle = env.vision.myAngle;
            this.calcAngleManually = false;
        }
        else{
            this.calcAngleManually = true;
            //console.log("Считаем угол сами")
        }

        this.seeRes = {time: env.vision.tact,
            pos: env.vision.myself,
            angle: this.agent.playerAngle,
        }
        if (env.vision.ball != undefined){
            if (this.seeRes.ball != undefined){
                this.seeRes.ballPrev = this.seeRes.ball
            }
            this.seeRes.ball = {x: env.vision.ball.pos.x, y: env.vision.ball.pos.y, f: "b",
                dist: env.vision.ball.dist[0], angle: -env.vision.ball.dist[1]}
        }
        let teamRes = this.getTeamMembers();
        this.seeRes.teamOwn = teamRes.myTeam;
        this.seeRes.team = teamRes.enemyTeam;

        this.seeRes.side = this.agent.position;


        this.seeRes.flags = this.env.vision.flags;


        let goal = "gl";
        let goalOwn = "gr"
        if (this.agent.position == "l"){
            goal = "gr";
            goalOwn = "gl";
        }
        this.calculateToFlag(this.seeRes.flags, this.seeRes.pos, this.seeRes.angle , goal);
        this.seeRes.goal = {x: Flags[goal].x, y: Flags[goal].y, dist: this.objectDistance, angle: this.angleToResearchPoint};
        this.calculateToFlag(this.seeRes.flags, this.seeRes.pos, this.seeRes.angle ,goalOwn);
        this.seeRes.goalOwn = {x: Flags[goalOwn].x, y: Flags[goalOwn].y, dist: this.objectDistance, angle: this.angleToResearchPoint};

        this.seeRes.calculateToFlag = this.calculateToFlag;

        console.log("pos = " + this.seeRes.side);
        this.sendCommad(Manager.Manager.getAction(this.seeRes, this.ta));

        console.log("\n")
    }


    sendCommad(command){
        if (!command){
            console.log("empty")
            return
        }
        if (command.n == "turn"){
            this.angleToResearchPoint = command.v;
            this.rotateAgent();
        }
        this.agent.socketSend(command.n, command.v);
    }


    kickBall(kickPower){
        this.agent.socketSend("kick", `${kickPower} ${-this.angleToResearchPoint}`);
    }


    calculateToFlag(flags,playerPos, playerAngle ,flagName){

        let reachPoint = Flags[flagName];

        //console.log("player =  x = " + playerPos.x + " y = " + playerPos.y);
        //console.log("flag =  x =" + reachPoint.x + "y = " + reachPoint.y );

        // проверяем видит ли игрок нужный флаг 
        let visibleFlag = flags.find((item) => {
            return item.name === flagName;
        });
        if (visibleFlag != undefined){
            // если видит, берем дистанцию до флага и угол из того, что игрок видит
            //console.log("Видим флаг") 
            this.objectDistance = visibleFlag.dist;
            this.angleToResearchPoint = -visibleFlag.angle;
        }
        else { 
            // если не видит, то расчитываем сами
            //console.log("Не видим флаг") 
            this.objectDistance = Flags.distance(playerPos, reachPoint);
            this.angleToResearchPoint = playerAngle - Flags.calculateAngle(playerPos, reachPoint);
            //console.log("playerAngle = " + playerAngle);
            //console.log("calculatedAngle = " + Flags.calculateAngle(playerPos, reachPoint));

            if (Math.abs(this.angleToResearchPoint) >= 180) {
                if (this.angleToResearchPoint < 0)
                    this.angleToResearchPoint =  -(this.angleToResearchPoint + 360)
                else
                    this.angleToResearchPoint =  (-this.angleToResearchPoint + 360)
            }
            else {
                this.angleToResearchPoint =  -this.angleToResearchPoint;
            }
            
        }
        return {dist: this.objectDistance, angle: this.angleToResearchPoint};  
    }
    

    rotateAgent(){
        //console.log("PlayerAngle = " + this.agent.playerAngle)
        //console.log("Вот это папапаварот " + -this.angleToResearchPoint);
        this.angleToResearchPoint = Math.round(this.angleToResearchPoint);
        this.agent.socketSend("turn", -this.angleToResearchPoint);
        if (this.calcAngleManually){
            this.agent.playerAngle += this.angleToResearchPoint;
            this.agent.playerAngle = (this.agent.playerAngle % 360 + 360) % 360;
            //console.log("Угол игрока ", this.agent.playerAngle);
        }
    }


    setGoalie(){
        this.agent.goalie = true;
        this.ta = Automates.GoalieTA;
    }

    getTeam(){
        return this.agent.teamName;
    }

    getTeamMembers(){
        let myTeam = [];
        let enemyTeam = [];
        this.env.vision.players.forEach(element => {
            //console.log(element.team);
            //console.log(this.agent.teamName);
            let player = {x: element.pos.x, y: element.pos.y, 
                dist: element.dist[0], angle: element.dist[1]};
            if (element.team === this.agent.teamName){

                teamMates.push(player);
            }
            else {
                enemyTeam.push(player);
            }
        });
        return {myTeam: myTeam, enemyTeam: enemyTeam};
    }

}


module.exports = Controller;