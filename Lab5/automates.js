const GoalieTA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { distToBall: null, getGoal: true}, // Переменные
        timers: { t: 0 }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {lookIter: 0}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
    рые есть переходы */
        start: { n: "start", e: ["ballInVision", "ballNotInVision"] },
        ballNotInVision: { n: "ballNotInVision", e: ["returnToGoal", "start"] },
        returnToGoal: { n: "returnToGoal", e: ["start"] },
        ballInVision: { n: "ballInVision", e: ["far", "close", "near"] },
        close: { n: "close", e: ["catch"] },
        catch: { n: "catch", e: ["kick"] },
        kick: { n: "kick", e: ["start"] },
        far: { n: "far", e: ["start"] },
        near: { n: "near", e: ["start"] },
    },
    edges: { /* Ребра автомата (имя каждого ребра указывает на
    узел-источник и узел-приемник) */
        start_ballInVision: [{ 
            guard: [{ s: "neq", l: { v: "distToBall" }, r: null },{ s: "lte", l: { v: "distToBall" }, r: 30 }],
            
        }],

        start_ballNotInVision: [{ 
            guard: [{ s: "eq", l: { v: "distToBall" }, r: null },] 
        },
        { 
            guard: [{ s: "gt", l: { v: "distToBall" }, r: 30 },] 
        },
    ],
        /* Список guard описывает перечень условий, проверяемых
        * для перехода по ребру. Знак lt - меньше, lte - меньше
        * либо равно. В качестве параметров принимаются числа или
        * значения переменных "v" или таймеров "t" */
        ballNotInVision_returnToGoal: [{
            synch: "notInGoal?",
        }],
        ballNotInVision_start: [{ 
            guard: [{ s: "lt", l: 10, r: { t: "t" } }],
            synch: "lookAround!",
            assign: [{ n: "t", v: 0, type: "timer" }]
        },
        {
            guard: [{ s: "lte", l: { t: "t" }, r: 10 }],
            synch: "ok!"
        }],

        returnToGoal_start: [{ synch: "returnToGoal!" , assign: [{ n: "t", v: 0,
        type: "timer" }] }],

        ballInVision_far: [{
            guard: [{ s: "gte", l: { v: "distToBall" }, r: 15 }],
        }],
        ballInVision_close: [{
            guard: [{ s: "lte", l: { v: "distToBall" }, r: 2 }],
        }],
        
        ballInVision_near: [{
            guard: [{ s: "gt", l: { v: "distToBall" }, r: 2 }],
            guard: [{ s: "lt", l: { v: "distToBall" }, r: 15 }],
        }],

        /* Событие синхронизации synch вызывает на выполнение
        * соответствующую функцию */


        near_start: [{ synch: "runToBall!", assign: [{ n: "t", v: 0,
        type: "timer" }] }],

        far_start: [
        {
            synch: "lookAtBall!",
            assign: [{ n: "t", v: 0, type: "timer" }]
        }],
        
        close_catch: [{ synch: "catch!" }],

        catch_kick: [{ synch: "kick!" }],

        kick_start: [{ synch: "returnToGoal!", assign: [{ n: "t", v: 0,
        type: "timer" }] }],

        /* Список assign перечисляет присваивания для переменных
        * "variable" и таймеров "timer" */

        /* Событие синхронизации synch может вызывать
        * соответствующую функцию для проверки возможности перехода
        * по ребру (заканчивается на знак "?") */

    },
    actions: {
        init(taken, state) { // Инициализация игрока
        },
        beforeAction(taken, state) {

            if (taken.ball){
                state.variables.distToBall = taken.ball.dist;
                console.log(taken.ball.angle);
                console.log(taken.ball.dist);
            }
            else{
                state.variables.distToBall = null;
            }
            //console.log(state.timers.t);

        },
        notInGoal(taken, state){
            state.next = true
            if (taken.side == "r"){
                if (taken.pos.x > 52 || taken.pos.x < 47 || taken.pos.y > 3 || taken.pos.y < -3 || (state.variables.getGoal !== true)) {
                    state.variables.getGoal = false;
                    return true;
                }
                else {
                    return false;
                }
            }
            else{
                if (taken.pos.x < -52 || taken.pos.x > -47 || taken.pos.y > 3 || taken.pos.y < -3 || (state.variables.getGoal !== true)) {
                    state.variables.getGoal = false;
                    return true;
                }
                else {
                    return false;
                }
            }
        },
        returnToGoal(taken, state){
            let goal;
            if (taken.side == "r"){
                goal = taken.calculateToFlag(taken.flags,taken.pos,taken.angle,"goaliePosR");
            }
            else {
                goal = taken.calculateToFlag(taken.flags,taken.pos,taken.angle,"goaliePosL");
            }
            if(goal.dist < 1){
                state.variables.getGoal = true;
                state.next = true;
                return {n: "turn", v: 180}
            }
            state.next = false;
            if (Math.abs(goal.angle) > 5){
                return { n: "turn", v: goal.angle }
            }
            else {
                return { n: "dash", v: 100 }
            }

        },
        catch(taken, state) { // Ловим мяч

            if (!taken.ball) {
                state.next = true
                return
            }
            console.log("Catch");
            state.next = false;
            let angle = taken.ball.angle
            if (taken.ball.dist < 0.5){
                state.next = true;
                return
            }

            //if (Math.abs(angle) > 15) return { n: "turn", v: angle }
            return { n: "catch", v: -angle }
        },
        kick(taken, state) { // Пинаем мяч
            state.next = true
            if (!taken.ball) return
            if(taken.ball.dist > 0.5) {
                this.runToBall(taken, state);
                return
            }
            let target = taken.goal
            return { n: "kick", v: `${100} ${-target.angle}` }

        },

        lookAround(taken, state) { // Осматриваемся
            console.log("lookAround");
            console.log(state.local.flags);
            if (taken.side == "r"){
                state.local.flags = ["fprb","fc", "fprt", "fc"]
            }
            else {
                state.local.flags = ["fplb","fc", "fplt", "fc"]
            }
            state.next = true;
            if (!state.local.lookIter)
                state.local.lookIter = 0;
            console.log("lookIter = " + state.local.lookIter);
            flag = taken.calculateToFlag(taken.flags,taken.pos,taken.angle,state.local.flags[state.local.lookIter])
            state.local.lookIter = (state.local.lookIter + 1) % state.local.flags.length;
            return { n: "turn", v: flag.angle}
        },

        runToBall(taken, state) { // Бежим к мячу
            console.log("runToBall");
            state.next = true
            let ball = taken.ball
            if (!ball) return this.returnToGoal(taken, state)

            if (Math.abs(ball.angle) > 3)
                return { n: "turn", v: ball.angle }

            let speed = 25;
            if (ball.dist < 10) speed = 25
            if (ball.dist < 5) speed = 100
            return { n: "dash", v: speed }
        },

        lookAtBall(taken, state){
            state.next = true;
            if (!taken.ball){
                return
            }
            return { n: "turn", v: taken.ball.angle }
        },

        ok(taken, state) { // Ничего делать не надо
            state.next = true; return {n: "turn", v: 0}
        },
    }
}

const PlayerTA = {
    current: "start", // Текущее состояние автомата
    state: { // Описание состояния
        variables: { scoreGoal: false, distToBall: null}, // Переменные
        timers: { t: 0 }, // Таймеры
        next: true, // Нужен переход на следующее состояние
        synch: undefined, // Текущее действие
        local: {}, // Внутренние переменные для методов
    },
    nodes: { /* Узлы автомата, в каждом узле: имя и узлы, на кото-
    рые есть переходы */
        start: { n: "start", e: ["ballInVision", "ballNotInVision"] },
        ballNotInVision: { n: "ballNotInVision", e: ["start"] },
        ballInVision: { n: "ballInVision", e: ["kick"] },
        kick: { n: "kick", e: ["start"] },
    },
    edges: { /* Ребра автомата (имя каждого ребра указывает на
    узел-источник и узел-приемник) */
        start_start: [{ 
            guard: [{ s: "eq", l: { v: "scoreGoal" }, r: true }], 
            synch: "ok!",
             
        }],

        start_ballInVision: [{ 
            guard: [{ s: "neq", l: { v: "distToBall" }, r: null }],
            assign: [{ n: "t", v: 0, type: "timer" }] 
        }],

        start_ballNotInVision: [{ 
            guard: [{ s: "eq", l: { v: "distToBall" }, r: null }] 
        }],

        /* Список guard описывает перечень условий, проверяемых
        * для перехода по ребру. Знак lt - меньше, lte - меньше
        * либо равно. В качестве параметров принимаются числа или
        * значения переменных "v" или таймеров "t" */
        

        ballNotInVision_start: [{
            guard: [{ s: "gt", l: 10, r: { t: "t" } }],
            synch: "lookAround!",
        },
        {
            guard: [{ s: "gte", l: { t: "t" }, r: 10 }],
            synch: "goToCentr!"
        }],


        ballInVision_kick: [{ 
            synch: "kick!" , 
        }],


        kick_start: [{
            synch: "turnToKick!",
            assign: [{ n: "t", v: 0, type: "timer" }]
        }],
  

    },
    actions: {
        init(taken, state) { // Инициализация игрока
        },
        beforeAction(taken, state) {

            if (taken.ball){
                state.variables.distToBall = taken.ball.dist;
            }
            else{
                state.variables.distToBall = null;
            }
            //console.log(taken.ball);
        },
        kick(taken, state) { // Пинаем мяч
            state.next = false
            let ball = taken.ball;
            if (!ball){
                state.next = false;
                this.lookAround(taken, state);
                return;
            }
            if (ball.dist <= 0.5) {
                let target = taken.goal;
                let speed = 40;
                if (target.dist < 25){
                    speed = 70;
                }
                state.next = true;
                return { n: "kick", v: `${speed} ${-target.angle}` }
            }
            if (Math.abs(ball.angle) > 5)
                return { n: "turn", v: ball.angle }

            return { n: "dash", v: 70 }
        },
        turnToKick(taken, state){
            console.log();
            state.next = true;
            return { n: "turn", v: taken.goal.angle}
        },
        goToCentr(taken, state){
            state.next = true;
            flag = taken.calculateToFlag(taken.flags,taken.pos,taken.angle,"fc")
            if (Math.abs(flag.angle) > 5){
                return { n: "turn", v: flag.angle }
            }
            else {
                return { n: "dash", v: 100 }
            }
        },

        lookAround(taken, state) { // Осматриваемся
            state.next = true;
            return { n: "turn", v: -30}
        },
        
        ok(taken, state) { // Ничего делать не надо
            state.next = true; return {n: "turn", v: 0}
        },
    }
}


module.exports.GoalieTA = GoalieTA;
module.exports.PlayerTA = PlayerTA;