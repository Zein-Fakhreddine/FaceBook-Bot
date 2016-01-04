//Required Modules
var faceBooklogin = require("facebook-chat-api");
var Cleverbot  = require('cleverbot-node');
var fs = require('fs');
var express = require('express');
//The boolean that checks if the bot is in clever mode
var isCleverBotActivated = false;
//My id
var myId = 100001621545283;
//Bots id
var botsId = 100011069644334;
//Checks if the bot is activated
var isBotActivated = false;


var app = express();

app.listen(process.env.PORT || 8000);

// Allow pinging to wake the server.
app.get('/', function (req, res) {
  res.send("I'm Good.");
});


faceBooklogin({email: "betterbotapp@gmail.com", password: "astronomy"}, function callback (err, api) {
    if(err) return console.error(err);


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