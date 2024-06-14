const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const WebSocketClient = require('websocket').client;
const { EventEmitter } = require('events');
const WebSocketServer = require('ws');

const app = express();
const server = http.createServer(app);

app.use(cors());
const wss = new WebSocket.Server({ server });

const myEmitter = new EventEmitter();
const client = new WebSocketClient();
const clients = new Set();

myEmitter.on('message', function (message) {
    // rebimos datos del socket
    var data;
    if (message.type === 'utf8') {
      //console.log("Received: '" + message.utf8Data + "'");
      data = message.utf8Data;
    } else {
      //console.log('receiving message', message.type, message.binaryData.length)
      data = message.binaryData;
    }
    //reenviamos cada mensaje a cada cliente conectado a nuestro servidor socket
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocketServer.OPEN) {
        console.log('enviando a socket', message.type, data.length)
          client.send(data);
      }
    });
  });

wss.on("connection", ws => {
    console.log("New client connected");
    clients.add(ws);

    // Enviar mensajes predefinidos solo cuando se conecta un nuevo cliente
    ws.send(JSON.stringify(primerMensaje));
    ws.send(JSON.stringify(segundoMensaje));
    ws.send(JSON.stringify(tercerMensaje));
    ws.send(JSON.stringify(cuartoMensaje));

    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
        clients.delete(ws);
    });

    ws.onerror = function () {
        console.log("Some error occurred");
    };
});

// Reenviar mensajes predefinidos a los clientes reconectados
wss.on('connection', ws => {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(primerMensaje));
            client.send(JSON.stringify(segundoMensaje));
            client.send(JSON.stringify(tercerMensaje));
            client.send(JSON.stringify(cuartoMensaje));
        }
    });
});
client.on('connectFailed', function (error) {
    console.log('Connect Error:', error.toString());
});

client.on('connect', function (connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log('Connection Error:', error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function (message) {
        myEmitter.emit('message', message);
    });
});

if (!client.connected) {
    client.connect('wss://ws-west7.betpredatorvideos.vip');
}

// Mensajes predefinidos
const primerMensaje = {
    eventType: "onServerInfo",
    onServerInfo: {
        serverName: "H5Live Server",
        serverVersion: "4.0.8.0",
        interfaceVersion: "1.0.0.0",
        events: ["onServerInfo", "onStreamInfo", "onStreamInfoUpdate", "onStreamStatus", "onMetaData", "onFrameDropStart", "onFrameDropEnd", "onRandomAccessPoint"],
        capabilities: ["onPause", "onPlay", "metaKeepAlive", "metastreamonly", "checkandclose"]
    }
};

const segundoMensaje = {
    eventType: "onStreamStatus",
    onStreamStatus: { status: "started" }
};

const tercerMensaje = {
    eventType: "onStreamInfo",
    onStreamInfo: {
        haveVideo: true,
        haveAudio: true,
        mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
        prerollDuration: 0,
        videoInfo: { width: 640, height: 360, frameRate: 29.97 },
        audioInfo: { sampleRate: 32000, channels: 2, bitsPerSample: 16 }
    }
};

const cuartoMensaje = {
    eventType: "onRandomAccessPoint",
    onRandomAccessPoint: { streamTime: 0 }
};

wss.on("connection", ws => {
    console.log("New client connected");

    // Enviar mensajes predefinidos solo cuando se conecta un nuevo cliente
    ws.send(JSON.stringify(primerMensaje));
    ws.send(JSON.stringify(segundoMensaje));
    ws.send(JSON.stringify(tercerMensaje));
    ws.send(JSON.stringify(cuartoMensaje));

    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`);
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.onerror = function () {
        console.log("Some error occurred");
    };
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
