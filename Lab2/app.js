const Agent = require('./agent') // Импорт агента
const VERSION = 7 // Версия сервера

let myAgent = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent, "teamA", VERSION) //Настройка сокета
//myAgent.readParam();


setTimeout(()=> {
    myAgent.socketSend("move", "-10 10");
}, 1000)




