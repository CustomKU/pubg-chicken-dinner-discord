const Discord = require('discord.js');
const moment = require('moment');
const colors = require('colors');

const Settings = require(process.argv.slice(2)[0] == null ? './settings.json' : ('./' + process.argv.slice(2)[0]));
const RecordMessage = require('./recordmessage');
const CommandListener = require('./listener/commandlistener');
const MessageListener = require('./listener/messagelistener');

const client = new Discord.Client();


//ready
client.on('ready', () => {
	console.log(colors.rainbow('[' + moment(new Date()).format('hh:mm:ss') + '] ' + `Logged in as ${client.user.tag}!`));
	console.log();
});

//message
client.on('message', msg => {
	if (msg.author.bot) return;
	if (msg.channel.type != 'text') return;


	switch (msg.channel.id) {
		case Settings.signupChannel: //signupChannel
			log(colors.green('signup       '), '#' + msg.channel.name + ' / ' + msg.author.tag + ' / ' + msg.content.split('\n')[0]);

			RecordMessage.signup(msg);
			break;

		case Settings.findPlayerChannel: //findPlayerChannel
			log(colors.yellow('findPlayer   '), '#' + msg.channel.name + ' / ' + msg.author.tag + ' / ' + msg.content.split('\n')[0]);

			RecordMessage.findPlayer(msg);
			break;
	}

	if (Settings.ignoreChannels.includes(msg.channel.id)) return;

	if (msg.content.startsWith(Settings.prefix)) {
		log(colors.yellow('command      '), '#' + msg.channel.name + ' / ' + msg.author.tag + ' / ' + msg.content.split('\n')[0]);
		var cmd = msg.content.split(' ');
		cmd[0] = cmd[0].substr(1);
		cmd[0] = cmd[0].toLowerCase();
		CommandListener.run(msg, cmd, msg.content);
	} else {
		log('message      ', '#' + msg.channel.name + ' / ' + msg.author.tag + ' / ' + msg.content.split('\n')[0]);
		MessageListener.run(msg, msg.content);
	}
});


//messageDelete
client.on('messageDelete', (msg) => {
	if (msg.channel.type != 'text') return;
	if (msg.embeds.length > 0) return;

	log(colors.red('messageDelete'), '#' + msg.channel.name + ' / ' + msg.author.tag + ' / ' + msg.content.split('\n')[0])
	RecordMessage.delete(client, msg);
});

//messageDeleteBulk
client.on('messageDeleteBulk', (data) => {
	var list = Array.from(data.values());
	for (i in list) {
		RecordMessage.delete(client, list[i]);
	}

	log(colors.red('messageDeleteBulk'), '#' + list[0].channel.name + ' / ' + list[0].author.tag + ' / #' + list.length)
});

//messageUpdate
client.on('messageUpdate', (oldMsg, newMsg) => {
	if (oldMsg.channel.type != 'text') return;
	if (oldMsg.embeds.length > 0) return;

	log(colors.yellow('messageUpdate'), '#' + oldMsg.channel.name + ' / ' + oldMsg.author.tag + ' / ' + oldMsg.content.split('\n')[0] + ' / ' + newMsg.content.split('\n')[0])
	RecordMessage.edit(client, oldMsg, newMsg);
});

//guildMemberAdd
client.on('guildMemberAdd', (member) => {
	log(colors.green('->') + ' join      ', member.user.tag);
	client.channels.get(Settings.welcomeChannel).send(Settings.emoji.in + ' <@' + member.id + '> 님, 이 채널에 배틀그라운드 닉네임을 입력해주세요.');
});

//guildMemberRemove
client.on('guildMemberRemove', (member) => {
	log(colors.red('<-') + ' quit      ', member.user.tag);
	client.channels.get(Settings.welcomeChannel).send(Settings.emoji.out + ' **' + member.user.username + '** 님이 나갔습니다.');
});

//init
async function init() {
	await client.login(Settings.token);
	client.user.setUsername(Settings.username);
	client.user.setActivity(Settings.statusmsg);
}

function log(title, content) {
	console.log('[' + moment(new Date()).format('hh:mm:ss') + '] ' + title + ' : ' + content);
}

init();
