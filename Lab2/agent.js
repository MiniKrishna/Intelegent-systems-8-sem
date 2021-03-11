const Msg = require('./msg') // Подключение модуля разбора сообщений от сервера
const readline = require('readline') // Подключение модуля ввода из командной строки
const Vision = require('./vision') // Подключения модуля зрения
const Controller = require('./controller')


const purposes = [{act: "flag", fl: "frb"}, {act: "flag", fl: "gl"},
{act: "flag", fl: "fc"}, {act: "kick", fl: "b", goal: "gr"}];

class Agent {
    constructor() {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.controller = new Controller(purposes, this);
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
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p)//Инициализация
        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }
    initAgent(p) {
        if (p[0] == "r") this.position = "r" // Правая половина поля
        if (p[1]) this.id = p[1] // id игрока
    }
    analyzeEnv(msg, cmdType, gameObjects) { // Анализ сообщения 
        // msg - text message with all information
        // cmdType - type of command
        // gameObjects - array, where type of elemement is [[params], [objectName]]. ObjectName is array of literals
        let visionRes = {}
        let senseRes = {};
        //console.log(cmdType);
        if (cmdType === "see") {
            // visionRes = {myself: {{x},{y}}, players: [{pos: {{x},{y}}, team: ""}], flags: {name: " ", dist, angle}}
            visionRes = Vision.calculatePos(gameObjects);
        }
        else if (cmdType === "sense_body"){
            //console.log(gameObjects);
            gameObjects.splice(0,1)
            senseRes = gameObjects;
            //console.log(senseRes);
        }
        if (!this.run) return;
        this.controller.processEnv({vision: visionRes, sense: senseRes});
    }
    sendCmd() {

    }
}
module.exports = Agent // Экспорт игрока
