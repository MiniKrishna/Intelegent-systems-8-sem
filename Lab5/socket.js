const dgram = require('dgram') // Модуль для работы с UDP
module.exports = function (agent, teamName, version, goalie = false) {
    // Создание сокета
    const socket = dgram.createSocket({
        type: 'udp4', reuseAddr:
            true
    })
    agent.setSocket(socket) // Задание сокета для агента
    socket.on('message', (msg, info) => {
        agent.msgGot(msg) // Обработка полученного сообщения
    })
    socket.sendMsg = function (msg) { // Отправка сообщения серверу
        socket.send(Buffer.from(msg), 6000, 'localhost', (err,
            bytes) => {
            if (err) throw err
        })
    }
    agent.teamName = teamName;
    // Инициализация игрока на сервере
    if (goalie){
        agent.controller.setGoalie();
        socket.sendMsg(`(init ${teamName} (version ${version}) (goalie))`)
    }
    else{
        agent.controller.goalie = false;
        socket.sendMsg(`(init ${teamName} (version ${version}))`)
    }
}