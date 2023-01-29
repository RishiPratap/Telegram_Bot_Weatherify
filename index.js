const axios = require('axios');
require('dotenv').config();
const { Telegraf } = require('telegraf');
var cron = require('node-cron');

const bot = new Telegraf(process.env.telegram_bot_api_key);

const WEATHER_API_KEY = process.env.weather_Api_key;
const WEATHER_API_URL = process.env.weather_url;

var allData;


const fetchWeather = async (cityName) => {
    const response = await axios.get(`${WEATHER_API_URL}?query=${cityName}&access_key=${WEATHER_API_KEY}`).then(
        (response) => {
            console.log(response.data);
            allData = response.data;
        }
    ).catch(
        (error) => {
            console.log(error);
        }
    ); 
    return allData; 
}

// fetchWeather('Delhi');

bot.start((ctx) => ctx.reply(`Welcome ${ctx.chat.first_name} \n\nI am a weather bot. I can tell you the weather in any city in the world. \n\nTo get started, enter the name of the city you want to know the weather of. \n\nFor example: Delhi \ntype /help to know more`));
bot.help((ctx) => ctx.reply(`1 Enter city name to get weather details \n 2 Click on subscribe button to get weather updates \n 3 Click on unsubscribe button to stop getting weather updates`));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.hears('/about', (ctx) => ctx.reply(`This bot is created by Rishi Pratap \n\nFor more info, visit Github repo: https://github.com/RishiPratap/Telegram_Bot_Weatherify`));
bot.on('text', async(ctx) => {
const message = ctx.message.text;
console.log(message);
const data =  await fetchWeather(message);
console.log(data);
if(data.success===false){
    ctx.reply(`Sorry, I don't know the weather in ${message} yet`);
}else{
    ctx.reply(`User ${ctx.chat.first_name} Current temperature in ${data.location.name} is ${data.current.temperature}℃ \n\nStatus: ${data.current.weather_descriptions} \n ${data.current.weather_icons[0]}`,{
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Subscribe 🔔', callback_data: 'moreInfo' }]
            ]
        }
    });
}
})
bot.action('moreInfo', (ctx) => {
    ctx.answerCbQuery();
    ctx.reply(`${ctx.chat.first_name},You will be notified when the weather changes after every 30 minutes`);
    var task = cron.schedule('*/30 * * * *', async() => {
        var data =  await fetchWeather('Delhi');
        console.log('running a task every 30 minutes');
        if(data===undefined || data===null || data===false){
            ctx.reply(`Sorry, I don't know the weather in ${message} yet`);
        }
        else{
            ctx.reply(`User ${ctx.chat.first_name} Current temperature in ${data.location.name} is ${data.current.temperature}℃ \n\nStatus: ${data.current.weather_descriptions} \n ${data.current.weather_icons[0]}`,{
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'UnSubscribe 🔔', callback_data: 'nomoreInfo' }]
                    ]
                }
            });
        }
        bot.action('nomoreInfo', (ctx) => {
            ctx.answerCbQuery();
            ctx.reply(`${ctx.chat.first_name},You will not be notified when the weather changes`);
            task.stop();
          });
      });
});
bot.launch();
