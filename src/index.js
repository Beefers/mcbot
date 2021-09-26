const mineflayer = require('mineflayer');
const mineflayerViewer = require('prismarine-viewer').mineflayer

const config = require('./config');
const bot = mineflayer.createBot({ username: config.username, host: config.host });

// bot.on('chat', async(username, message) => {
//     console.log(`username: ${username} ||| message: ${message}`);
//     if(message.startsWith('/register')) {
//         bot.chat(`/register ${config.auth.password} ${config.auth.password}`);
//     } else if (message.startsWith('/login')) {
//         bot.chat(`/login ${config.auth.password}`);
//     }
// })

bot.once('spawn', () => {
    const before = Date.now();
    const mcData = require('minecraft-data')(bot.version);
    mineflayerViewer(bot, { port: 3000 }); // Start the viewing server on port 3000

    bot.chat(`/home`);
    bot.chat(`/skin set ${config.botOwner}`);

    bot.on('respawn', () => {
        bot.chat(`/home`)
    })

    bot.on('chat', async(username, message) => {
        if (!config.whitelist.includes(username)) return;
        if (!message.startsWith('me]')) return;

        const content = message.slice(4).trim().split(' ');
        const command = content[0];
        const args = content.slice(1);

        switch(command) {
            case 'echo':
                bot.chat(args.join(' '));
            break
            case 'eval':
                const before = Date.now();
                let evaluated;

                try {
                    evaluated = await eval(args.join(' '));
                    return bot.chat(`/msg ${username} Expression: ${args.join(' ')} | Callback: ${evaluated} | Time: ${Date.now() - before}ms | TypeOf: ${typeof evaluated}`);
                } catch(error) {
                    console.log(`An exception was thrown when ${username} tried to evaluate code`, error);
                    return bot.chat(`/msg ${username} An error! Expression: ${args.join(' ')} | Exception: ${error}`);
                }
            break

            case 'pos':
                bot.chat(`/msg ${username} Currently I am at ${bot.entity.position}`);
            break

            case 'playerPos':
                let posBot = mineflayer.createBot({ username: args[0], host: config.host });
                
                posBot.on('spawn', async() => {
                    bot.chat(`/msg ${username} Player's position is ${bot.entity.position}`);
                    posBot.quit();
                })

                bot.on('kicked', (reason, loggedIn) => { bot.chat(`/msg ${username} posBot was kicked: ${reason} | loggedIn: ${loggedIn}`) });
                bot.on('error', (error) => { bot.chat(`/msg ${username} posBot encountered an error: ${error}`) });
            break

            case 'bringPlayer':
                let bringBot = mineflayer.createBot({ username: args[0], host: config.host });
                
                bringBot.on('spawn', async() => {
                    await bringBot.chat(`/tpa ${bot.username}`);
                    await bot.chat(`/tpaccept`);
                })

                bot.on('kicked', (reason, loggedIn) => { bot.chat(`/msg ${username} bringBot was kicked: ${reason} | loggedIn: ${loggedIn}`) });
                bot.on('error', (error) => { bot.chat(`/msg ${username} bringBot encountered an error: ${error}`) });
            break

            case 'kickPlayer':
                let kickBot = mineflayer.createBot({ username: args[0], host: config.host });
                
                kickBot.on('spawn', async() => {
                    kickBot.quit();
                })

                bot.on('kicked', (reason, loggedIn) => { bot.chat(`/msg ${username} kickBot was kicked: ${reason} | loggedIn: ${loggedIn}`) });
                bot.on('error', (error) => { bot.chat(`/msg ${username} kickBot encountered an error: ${error}`) });
            break

            case 'tpa':
                bot.chat(`/tpa ${username}`);
                bot.chat(`/msg ${username} Please run /tpaccept in chat to bring me.`);
            break


            case 'accept':
                bot.chat(`/tpaccept`);
                bot.chat(`/msg ${username} Ran /tpaccept.`);
            break

            case 'server':
                bot.chat(`/msg ${username} IP: ${config.host} | Version: ${bot.version}`)
            break
        }
    })
    let initMsg = `Initialised in ${Date.now() - before}ms.`;
    console.log(initMsg);
    bot.chat(`/msg ${config.botOwner} ${initMsg}`);
})

// Log errors and kick reasons:
bot.on('kicked', console.log);
bot.on('error', console.log);