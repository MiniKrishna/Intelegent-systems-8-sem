const Agent = require('./agent'); // Импорт агента
const VERSION = 7; // Версия сервера

let myAgent = new Agent(); // Создание экземпляра агента
require('./socket')(myAgent, "teamA", VERSION); //Настройка сокета
//myAgent.readParam();

//let myAgent1 = new Agent(); // Создание экземпляра агента
//require('./socket')(myAgent1, "teamB", VERSION) //Настройка сокета

setTimeout(()=> {
    myAgent.socketSend("move", "-10 10");
    //myAgent1.socketSend("move", "-20 -10");
}, 1000)




