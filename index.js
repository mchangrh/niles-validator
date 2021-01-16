// imports
require('dotenv').config()
const Discord = require('discord.js')
const { IANAZone, FixedOffsetZone } = require("luxon");

// functions
function validateTz(tz) {
    const isValid = (IANAZone.isValidZone(tz) || (FixedOffsetZone.parseSpecifier(tz) !== null && FixedOffsetZone.parseSpecifier(tz).isValid));
    return (isValid ? "Valid Timezone 🟢" : "Invalid Timezone 🔴");
}

function validateUrl(url) {
    let urlPattern = new RegExp("(http|https)://(\\w+:{0,1}\\w*)?(\\S+)(:[0-9]+)?(/|/([\\w#!:.?+=&%!-/]))?");
    return (urlPattern.test(url) ? "Valid URL 🟢" : "Invalid URL 🔴");
}

function validateCalId(calendarId) {
    // regex filter groups
  const groupCalId = RegExp("([a-z0-9]{26}@group.calendar.google.com)");
  const cGroupCalId = RegExp("^(c_[a-z0-9]{26}@)");
  const importCalId = RegExp("(^[a-z0-9]{32}@import.calendar.google.com)");
  const gmailAddress = RegExp("^([a-z0-9.]+@gmail.com)");
  const underscoreCalId = RegExp("^[a-z0-9](_[a-z0-9]{26}@)");
  const domainCalId = RegExp("^([a-z0-9.]+_[a-z0-9]{26}@)");
  const domainAddress = RegExp("(^[a-z0-9_.+-]+@[a-z0-9-]+.[a-z0-9-.]+$)");
  // filter through regex
  if (gmailAddress.test(calendarId)) { // matches gmail
  } else if (importCalId.test(calendarId)) { // matches import ID
  } else if (groupCalId.test(calendarId)) {
    if (cGroupCalId.test(calendarId)) { // matches cGroup
    } else if (domainCalId.test(calendarId)) {
      return "Warning 🟠: GSuite/ Workplace - please see https://nilesbot.com/start/#gsuiteworkplace";
    } else if (underscoreCalId.test(calendarId)) {
      return "Warning 🟠: New Calendar Format - please see https://nilesbot.com/start/#new-calendar-format";
    }
    return "Passed 🟢: Valid Calendar ID"; // normal group id or any variation
  } else if (domainAddress.test(calendarId)) {
    return ("Warning 🟠: GSuite/ Workplace - please see https://nilesbot.com/start/#gsuiteworkplace");
  } else {
    return "Failed 🔴: Invalid Calendar ID"; // break and return false
  }
  return "Passed 🟢: Valid Calendar ID"; // if did not reach false
}

const client = new Discord.Client() // create client
client.on('ready', () => {
  console.log('Ready')
  client.user.setPresence({ // set presence
    activity: { type: process.env.ACT_TYPE, name: process.env.ACT_NAME },
    status: process.env.STATUS
  })
})
client.login(process.env.TOKEN) // login

client.on('message', message => {
  const prefix = process.env.PREFIX // set prefix
  if (!message.author.bot && message.content.startsWith(prefix)) { // check if sent by self & check for prefix
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();
    if (command === 'help') {
        message.channel.send('Valid Commands: `url/ tz/ calendar/ help`')
    } else if (args[0]) {
        if (['calendar', 'cal', 'c'].includes(command)) { // clean url
            message.channel.send(validateCalId(args[0]))
        } else if (['url', 'u'].includes(command)) { // unshorten url
            message.channel.send(validateUrl(args[0]))
        } else if (['tz', 't'].includes(command)) {
            message.channel.send(validateTz(args[0]))
        }
    } else {
        message.channel.send("Please include value to test")
    }
}})

process.on('uncaughtException', function(err) { 
	console.log(err) 
})
