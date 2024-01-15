import express from "express";
import bodyParser from "body-parser";
import http from 'http';
import { Server } from 'socket.io';
import net from 'net';

import https from 'https';
import fs from 'fs';

const app = express();
const app2 = express();
const port = 3000;
const mypassword = "emz"; // it is just for - it is not secure


const privateKey = fs.readFileSync('server.key', 'utf8');
const certificate = fs.readFileSync('server.cert', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// const server = https.createServer(credentials, app);
// const io = new Server(server);

const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);

// const io = new Server(httpServer);

const io = new Server();

io.attach(httpServer);
io.attach(httpsServer);

const arduinoHost = '192.168.50.201';
const arduinoPort = 8080;

var userIsAuthorised = false;
var aname = [];
var bname = [];
var tname = [];
var count = 0;

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));

io.on('connection', (socket) => {
  socket.on('command', (data) => {
    const client = new net.Socket();

    client.connect(arduinoPort, arduinoHost, () => {
      console.log('Connected to Arduino');
      client.write(`${data}\n`);
      client.end();
    });

    client.on('error', (err) => {
      console.error('Error connecting to Arduino:', err.message);
    });
  });
});


function passwordCheck(req, res, next) {
  const password = req.body["password"];
  if (password === "emz") {
    userIsAuthorised = true;
  }
  next();
  }

app.use(passwordCheck);

app.get("/", (req,res) => {
    
  console.log("hello");
  res.render("index.ejs");
  
  })


app.get("/test", (req,res) => {
  res.render("test.ejs");

})
   
app.get("/about", (req,res) => {
    res.render("about.ejs");
})

app.get("/control", (req,res) => {
  if (userIsAuthorised) {
    res.render("control.ejs");
    } else {
    res.redirect("/");
    }
})


app.get("/contact", (req,res) => {
    res.render("contact.ejs");
})

app.post("/control", (req, res) => {
  if (userIsAuthorised) {
      res.render("control.ejs");
      } else {
      res.redirect("/");
      }

});  




httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

    

httpsServer.listen(443, () => {
  console.log(`HTTPS Server running on port 443`);
});