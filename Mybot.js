//Required Modules
var faceBooklogin = require('facebook-chat-api');
var Cleverbot  = require('cleverbot-node');
var fs = require('fs');
var express = require('express');
var http = require('http');
var joke = require('jokesearch');
var scSearch = require('soundcloud-search-node');
//The boolean that checks if the bot is in clever mode
var isCleverBotActivated = false;
//My id (loaded through heroku variables)
var myId = process.env.FACEBOOK_ID;
//Bots id (loaded through heroku variables)
var botsId = process.env.FACEBOOK_BOTID;
//Checks if the bot is activated
var isBotActivated = true;
//Does not ping the first time the bot is activated
var readyToPing = false;
//Checks if the cleverbot is prepared
var isCleverBotReady = false;
var app = express();

app.listen(process.env.PORT || 8000);

// Allow pinging to wake the server.
app.get('/', function (req, res) {
    res.send("I'm Good.");
});



if(!isCleverBotReady){
    cleverbot = new Cleverbot;
    Cleverbot.prepare(function(){
        isCleverBotReady = true;
    });
}

//Use the "facebook-chat-api" to log into facebook with heroku varaibles
faceBooklogin({email: process.env.FACEBOOK_USERNAME, password: process.env.FACEBOOK_PASSWORD}, function callback (err, api) {
    if(err) return console.error(err);
//Allow the chat api to listen to Facebook messages
    api.setOptions({listenEvents: true});

    //Function to ping the heroku site every 5 minutes so it doesn't idle
    setInterval(function() {
        console.log("PINGING");
        if(readyToPing){
            api.logout(function callback(err){
                if(err) return console.error(err);
                http.get("myfacebookbot.herokuapp.com");
            });
        }

        readyToPing = true;
    }, 120000); // every 2 minutes (120000)

    api.listen(function(err, event) {
        if(err) return console.error(err);
        console.log("The event type is" + event.type);

        switch(event.type) {
            case "message": //Making sure the message is a message
                if(event.senderID == botsId)
                    return;
                var message = String(event.body).toUpperCase();

                if(message == 'ACTIVATEBOT' && event.senderID == myId){
                    isBotActivated = !isBotActivated;
                    if(isBotActivated){
                        api.sendMessage("MyBot activated", event.threadID);
                    }else{
                        api.sendMessage("MyBot deactivated", event.threadID);
                    }
                }
                if(!isBotActivated)
                    return;
                if(message.indexOf('ERF') != -1){
                    var msg = {
                        body: "Gabe",
                        attachment: fs.createReadStream(__dirname + '/Gabe.jpg')
                    }
                    api.sendMessage(msg, event.threadID);
                }
                if(isCleverBotActivated && isCleverBotReady){
                    cleverbot.write(event.body, function (response) {
                        api.sendMessage(response.message, event.threadID);
                    });
                }
                if(message == 'CLEVERBOT'){
                    isCleverBotActivated = !isCleverBotActivated;
                    if(isCleverBotActivated){
                        api.sendMessage("Cleverbot activated", event.threadID);
                    }
                    else{
                        api.sendMessage("Cleverbot deactivated", event.threadID);
                    }
                }

                if(message == 'DYNAMICDJ'){
                    scSearch.getTracks("The chainsmokers", 1, function(tracks){
                        api.sendMessage(tracks[0].title, event.threadID);
                    });
                }

                if(message == 'JOKE'){
                    joke.getJoke(function callback(joke){
                        api.sendMessage(joke, event.threadID);
                    });
                }
                if(message.indexOf('USMAN') != -1){
                    var msg = {
                        body: "Edward",
                        attachment: fs.createReadStream(__dirname + '/Edward.jpg')
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
