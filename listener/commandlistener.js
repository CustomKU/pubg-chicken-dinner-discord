const moment = require('moment');
const colors = require('colors');
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');

//const RecordMessage = require('../recordmessage');
const help = require('./help.json');
//const Settings = require(process.argv.slice(2)[0] == null ? '../settings.json' : ('../' + process.argv.slice(2)[0]));


exports.run = (msg, cmd, content) => {
	if (exports.commandlist[cmd[0]])
		exports.commandlist[cmd[0]](msg, cmd, content);
	else
		msg.channel.send("존재하지 않는 명령어입니다.");
};
exports.commandlist = {
	help: (msg, cmd) => {
		if (cmd[1] && help[cmd[1]] !== undefined) {
			msg.channel.send('```' + help[cmd[1]] + '```');
		} else if (cmd[1] && exports.commandlist[cmd[1]] !== undefined) {
			msg.channel.send("설명서가 없는 명령어입니다.");
		} else if (cmd[1]) {
			msg.channel.send("존재하지 않는 명령어입니다.");
		} else {
			msg.channel.send('```' + Object.keys(exports.commandlist).join(', ') + '```');
		}
	},
	pubg: (msg, cmd) => {
		var name;
		if (cmd[1])
			name = cmd[1];
		else
			name = msg.member.nickname != null ? msg.member.nickname : msg.member.user.username;

		log(colors.magenta('career       '), name);
		RecordMessage.career(msg, name, false);
	},
	pubgall: (msg, cmd) => {
		var name;
		if (cmd[1])
			name = cmd[1];
		else
			name = msg.member.nickname != null ? msg.member.nickname : msg.member.user.username;

		log(colors.magenta('career       '), name);
		RecordMessage.career(msg, name, true);
	},
	status: (msg, cmd) => {
		request('https://dak.gg/statistics/server', (error, response, body) => {
			if (error) throw error;
			var $ = cheerio.load(body);

			var status = $(".serverStatus").find("a").find("span").html();
			var curr_players = $(".container").find("div").find("p").html().replace(/[ <>%/_\-=#:\[\]\n"a-zA-Z가-힣]/g, "");

			var color = {
				"Online": 0x669933,
				"Lag": 0xffcc33,
				"Unstable": 0xff6633,
				"Offline": 0xff6633
			}
			var statusmsg = {
				"Online": "정상",
				"Lag": "렉 심함",
				"Unstable": "일부 장애",
				"Offline": "접속 불가"
			}
			msg.channel.send({
					embed: {
						color: color[status],
						author: {
							name: msg.member.nickname != null ? msg.member.nickname : msg.member.user.username,
							icon_url: msg.author.avatarURL
						},
						title: '배틀그라운드 서버 정보',
						fields: [{
							name: '서버 상태',
							value: statusmsg[status],
							inline: true
						}, {
							name: '동시 접속자',
							value: curr_players,
							inline: true
						}],
						footer: {
							text: 'dak.gg'
						}
					}
				});
		});
	},
	developer: (msg, cmd) => {
		msg.channel.send('<@251740980858847233>');
	},
	download: (msg, cmd) => {
		msg.channel.send("Download UniPad in Google Play! Link: https://play.google.com/store/apps/details?id=com.kimjisub.launchpad")
	}
};



function log(title, content) {
	console.log('[' + moment(new Date()).format('hh:mm:ss') + '] ' + title + ' : ' + content);
}
