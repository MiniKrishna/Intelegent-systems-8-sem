const Msg = require('./msg') // Подключение модуля разбора сообщений от сервера
const readline = require('readline') // Подключение модуля ввода из командной строки

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
	    if (typeof this.f !== 'undefined')
	        return true;
	    return false;
	},
}

class Agent {
    constructor() {
        this.position = "l" // По умолчанию - левая половина поля
        this.run = false // Игра начата
        this.moment = 0;
    }
    async readParam() {
        this.rl = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })
        let xCoord;
        let yCoord;
        let moment;
        do {
            xCoord = await this.readLine("X coord: ");
        } while (Math.abs(xCoord) > 54);

        do {
            yCoord = await this.readLine("Y coord: ");
        } while (Math.abs(yCoord) > 32);

        do {
            moment = await this.readLine("Moment: ");
        } while (Math.abs(moment) > 180);
   
        this.moment = moment;
        this.socketSend("move", `${xCoord} ${yCoord}`)
        console.log(`${xCoord} ${yCoord}` + " " + moment);
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
	console.log(gameObjects);
	if (cmdType === "see") {
	    let flagArray = [];
	    for (let element of gameObjects) {
	    	if (Flags.contains(element.cmd.p.join('')))
	    	   console.log(true);
	    }
	}
    }
    sendCmd() {
        if (this.run) { // Игра начата
            this.socketSend("turn", this.moment)
        }
    }
}
module.exports = Agent // Экспорт игрока
