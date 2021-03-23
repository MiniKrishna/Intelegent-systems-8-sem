const Msg = require('./msg') // Подключение модуля разбора сообщений от сервера
const readline = require('readline') // Подключение модуля ввода из командной строки
const Vision = require('./vision') // Подключения модуля зрения
const Controller = require('./controller')


const purposes = [{act: "flag", fl: "fplb"}, {act: "flag", fl: "fprt"},
{act: "flag", fl: "flt"}, {act: "flag", fl: "fc"}];

class Agent {
    constructor() {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.controller = new Controller(purposes, this);
        this.env = {vision: {myself: {}}};
        this.envReady = {visionMsgGot: false, senseMsgGot: false, 
            ready(){return this.visionMsgGot && this.senseMsgGot}, 
            reset(){ this.senseMsgGot = false; this.visionMsgGot = false}
        };
        this.playerAngle = 0;
    }
    async readParam() {
        this.rl = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        let xCoord;
        let yCoord;
        do {
            xCoord = await this.readLine("X coord: ");
        } while (Math.abs(xCoord) > 54);

        do {
            yCoord = await this.readLine("Y coord: ");
        } while (Math.abs(yCoord) > 32);
   
        this.socketSend("move", `${xCoord} ${yCoord}`)
    }

    async readLine(str) {
        return new Promise(resolve => {
            this.rl.question(str, answer => { resolve(answer); });
        });
    }

    msgGot(msg) { // Получение сообщения
        let message = msg.toString('utf8') // Приведение к строке
        this.processMsg(message) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }
    setSocket(socket) { // Настройка сокета
        this.socket = socket
    }
    socketSend(cmd, value) { // Отправка команды
        this.socket.sendMsg(`(${cmd} ${value})`)
    }
    processMsg(msg) { // Обработка сообщения
        let data = Msg.parseMsg(msg) // Разбор сообщения
        if (!data) throw new Error("Parse error\n" + msg)
        // Первое (hear) - начало игры
        if (data.cmd == "hear") {
            this.run = true;
        }
        if (data.cmd == "init") this.initAgent(data.p)//Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }
    initAgent(p) {
        if (p[0] == "r"){
            this.position = "r"; // Правая половина поля
            this.playerAngle = 180;
        } 
        if (p[1]) this.id = p[1]; // id игрока
    }
    analyzeEnv(msg, cmdType, gameObjects) { // Анализ сообщения 
        // msg - text message with all information
        // cmdType - type of command
        // gameObjects - array, where type of elemement is [[params], [objectName]]. ObjectName is array of literals

        if (cmdType === "see"){
            // visionRes = {myself: {{x},{y}}, players: [{pos: {{x},{y}}, team: ""}], flags: {name: " ", dist, angle}}
            let visionRes = Vision.calculatePos(gameObjects, this.env.vision.myself);
            this.env.vision = visionRes;
            this.envReady.visionMsgGot = true;
        }
        else if (cmdType === "sense_body"){
            gameObjects.splice(0,1);
            let senseRes = gameObjects;
            this.env.sense = senseRes;
            this.envReady.senseMsgGot = true;
        }
        if (!this.run) return;
        if (this.envReady.ready()){
            this.controller.processEnv(this.env);
            this.envReady.reset();
        }

    }
    sendCmd() {

    }
    move(pos){
        console.log(`${pos.x} ${pos.y}`);
        setTimeout(()=> {
            this.socketSend("move", `${pos.x} ${pos.y}`);
        }, 1000)
        this.env.vision.myself = pos;
    }
}
module.exports = Agent // Экспорт игрока
