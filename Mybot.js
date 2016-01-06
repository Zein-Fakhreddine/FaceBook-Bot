//Required Modules
var faceBooklogin = require("facebook-chat-api");
var Cleverbot  = require('cleverbot-node');
var fs = require('fs');
var express = require('express');
var http = require("http");

//The boolean that checks if the bot is in clever mode
var isCleverBotActivated = false;
//My id (loaded through heroku variables)
var myId = praseInt(process.env.FACEBOOK_ID);
//Bots id (loaded through heroku variables)
var botsId = parseInt(process.env.FACEBOOK_BOTID);
//Checks if the bot is activated
var isBotActivated = true;
var readyToPing = false;

var app = express();

app.listen(process.env.PORT || 8000);

// Allow pinging to wake the server.
app.get('/', function (req, res) {
  res.send("I'm Good.");
});

//Function to ping the heroku site every 5 minutes so it doesn't idle
setInterval(function() {
    console.log("PINGING");
    if(readyToPing)
        http.get("myfacebookbot.herokuapp.com.herokuapp.com");
    readyToPing = true;
}, 300000); // every 5 minutes (300000

//Use the "facebook-chat-api" to log into facebook with heroku varaibles 
faceBooklogin({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);

//Allow the chat api to listen to Facebook messages
 api.setOptions({listenEvents: true});
    
    var stopListening = api.listen(function(err, event) {
        if(err) return console.error(err);
        console.log("The event type is" + event.type);
        
        switch(event.type) {
        
          case "message":
            
            if(event.senderID == botsId)
                return;
            
                
            if(event.body == 'ActivateBot' && event.senderID == myId){
              isBotActivated = !isBotActivated;
                if(isBotActivated){
                      api.sendMessage("MyBot activated", event.threadID);
                }else{
                     api.sendMessage("MyBot deactivated", event.threadID);
                }
            } 
            if(!isBotActivated)
                return;   
                
            if(String(event.body).indexOf('erf') != -1){
                //api.sendMessage("That guys sucks", event.threadID);
                var msg = {
                    body: "Gabe",
                    attachment: fs.createReadStream(__dirname + '/Gabe.jpg')
                }
                api.sendMessage(msg, event.threadID);
            }
            if(isCleverBotActivated){
                console.log("YO THIS IS WORKING");
                cleverbot = new Cleverbot;
                Cleverbot.prepare(function(){
                cleverbot.write(event.body, function (response) {
                    api.sendMessage(response.message, event.threadID);
                    });
                });
            }
            
            if(event.body == 'CleverBot'){
                isCleverBotActivated = !isCleverBotActivated;   
                if(isCleverBotActivated){
                    api.sendMessage("Cleverbot activated", event.threadID);
                }
                else{
                    api.sendMessage("Cleverbot deactivated", event.threadID);   
                }
            }
            
            if(String(event.body).indexOf("image ") != -1){
                var images = String(event.body).replace("image ", "");
                 var msg = {
                    body: "Image",
                    attachment: fs.createReadStream('F:/Pictures/Saved Images/' + images)
                }
                api.sendMessage(msg, event.threadID);
            }
            break;
          case "event":
            console.log(event);
            break;
        }
    });
});