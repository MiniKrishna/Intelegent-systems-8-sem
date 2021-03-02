const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
// Подключение модуля ввода из командной строки
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
            xCoord = await this.readLine("X coodrd: ");
        } while (Math.abs(xCoord) > 54);

        do {
            yCoord = await this.readLine("Y coodrd: ");
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
        let data = msg.toString('utf8') // Приведение к строке
        this.processMsg(data) // Разбор сообщения
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
    analyzeEnv(msg, cmd, p) { // Анализ сообщения
    }
    sendCmd() {
        if (this.run) { // Игра начата
            this.socketSend("turn", this.moment)
        }
    }
}
module.exports = Agent // Экспорт игрока