const Discord = require("discord.js");
const fetch = require("node-fetch");
const Database = require("@replit/database")

const db = new Database();
const client = new Discord.Client();

const sadWords = ["sad", "depressed", "unhappy", "angry"];
const starterEncouragements = [
    "Cheer up!",
    "Hang in there.",
    "You are a great person or bot!"
];


db.get("encoragements").then(encouragements => {
    // Encouragements for null OR zero
    if(!encouragements || encouragements.length < 1) {
        db.set("encouragements", starterEncouragements)
    }
})

let updateEncouragements = (encouragingMessage) => {
    db.get("encouragements").then(encouragements => {
        encouragements.push([encouragingMessage])
        db.set("encouragements", encouragements)
    })
}

let deleteEncouragement = (index) => {
    db.get("encouragements").then(encouragements => {
        if (encouragements.length > index) {
            encouragements.splice(index, 1)
            db.set("encouragements", encouragements)
        }
    })
} 

let getQuote = () => {
    return fetch("https://zenquotes.io/api/random")
    .then(res => {
        return res.json()
    })
    .then(data => {
        // q = quote and a = author
        return data[0]["q"] + " -" + data[0] ["a"]
    })
};

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

client.on("message", msg => {
   if (msg.author.bot) return 
   
   if (msg.content === "$inspire") {
    getQuote().then(quote => msg.channel.send(quote))
   }

//    Goes through each word in a message to check if it includes a word from the array
   if(sadWords.some(word => msg.content.includes(word))){
    //    get messages from database
    db.get("encouragements").then(encouragements => {
        //    randomises an encouragement using a random index number ot pull the encouragement
        const encouragement = encouragements[Math.floor(Math.random() * encouragements.length)]
        msg.reply(encouragement)
    })
   }

   if (msg.content.startsWith("$new")) {
       encouragingMessage = msg.content.split("$new ")[1]
       updateEncouragements(encouragingMessage)
       msg.channel.send("New encouraging message added.")
   }

   if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteEncouragement(index)
    msg.channel.send("Encouraging message deleted.")
}
});

client.login(process.env.TOKEN);