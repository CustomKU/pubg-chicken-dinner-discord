const moment = require('moment');
const request = require('request');
const rp = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');

const Settings = require(process.argv.slice(2)[0] == null ? './settings.json' : ('./' + process.argv.slice(2)[0]));

exports.delete = (client, msg) => {
	client.channels.get(Settings.recordMessage.delete).send({
		embed: {
			color: 0xff6b68,
			author: {
				name: msg.author.tag,
				icon_url: msg.author.avatarURL
			},
			description: 'Message Deleted at ***' + msg.channel.parent.name + '*** / ' + msg.channel,
			fields: [{
				name: 'Message',
				value: msg.content,
			}, {
				name: 'Message at',
				value: dateToString(new Date(msg.createdTimestamp)),
				inline: true
			}, {
				name: 'Ago Time',
				value: agoTime(new Date, new Date(msg.createdTimestamp)) + ' 전',
				inline: true
			}],
			footer: {
				text: dateToString(new Date()) + ' | User ID: ' + msg.author.id
			}
		}
	});
};

exports.edit = (client, oldMsg, newMsg) => {
	client.channels.get(Settings.recordMessage.delete).send({
		embed: {
			color: 0xe67e22,
			author: {
				name: newMsg.author.tag,
				icon_url: newMsg.author.avatarURL
			},
			description: 'Message Edited at ***' + oldMsg.channel.parent.name + '*** / ' + oldMsg.channel,
			fields: [{
				name: 'Before',
				value: oldMsg.content,
			}, {
				name: 'After',
				value: newMsg.content,
			}, {
				name: 'Message at',
				value: dateToString(new Date(newMsg.createdTimestamp)),
				inline: true
			}, {
				name: 'Ago Time',
				value: agoTime(new Date, new Date(newMsg.createdTimestamp)) + ' 전',
				inline: true
			}],
			footer: {
				text: dateToString(new Date()) + ' | User ID: ' + newMsg.author.id
			}
		}
	});
};

exports.signup = async (msg) => {
	if (/^[0-9a-zA-Z_-]+$/g.test(msg.content)) {
		if (!msg.member.roles.has(Settings.role.member)) {
			async function run() {
				await msg.member.addRole(Settings.role.member);
				try {
					await msg.member.setNickname(msg.content);
					msg.channel.send(msg.content + ' 님이 신규 등록되었습니다.');
				} catch (DiscordAPIError) {
					msg.channel.send('신규 등록은 되었지만 봇 권한 부족으로 닉네임 변경에 실패하였습니다.');
				}
			}
			run();
		} else {
			async function run() {
				try {
					var prevId = msg.member.nickname != null ? msg.member.nickname : msg.member.user.username;
					await msg.member.setNickname(msg.content);
					msg.channel.send(prevId + ' 님의 닉네임이 ' + msg.content + ' 로 변경되었습니다.');
				} catch (DiscordAPIError) {
					msg.channel.send('봇 권한 부족으로 닉네임 변경에 실패하였습니다.');
				}
			}
			run();
		}
	} else {
		var reply = await msg.reply(msg.content + ' 은(는) 배틀그라운드 닉네임 형식이 아닙니다.');
		setTimeout(() => {
			reply.delete();
			msg.delete();
		}, 3000);
	}
}

exports.findPlayer = async (msg) => {

	if (msg.member.voiceChannel != undefined) {
		var maxAge = 60 * 5;
		msg.member.voiceChannel.createInvite({
				maxAge: maxAge
			})
			.then(async (invite) => {
				var expirationDate = new Date(new Date().getTime() + maxAge * 1000);

				var voiceChannel = msg.member.voiceChannel;
				var name = msg.member.nickname != null ? msg.member.nickname : msg.member.user.username;
				var icon_url = msg.author.avatarURL;
				var description = '**' + msg.member.voiceChannel.parent.name + '** / ' + msg.member.voiceChannel;
				var inviteMsg = msg.content;
				var url = '\n\n[' + '**' + msg.member.voiceChannel.parent.name + '** / ' + msg.member.voiceChannel + ' 음성채널에 참가하세요.](' + invite.url + ')';

				var members = '';
				var members_cnt = 0;
				voiceChannel.members.forEach((value, key, mapObj) => {
					members += (value.nickname != null ? value.nickname : value.user.username) + '\n';
					members_cnt++;
				})

				var reply = await msg.channel.send({
					embed: {
						color: 0x3498db,
						author: {
							name: name,
							icon_url: icon_url
						},
						description: description,
						fields: [{
							name: '초대 메시지 ━━━━━━━',
							value: inviteMsg,
						},{
							name: '참가 인원 (' + members_cnt + '/' + voiceChannel.userLimit + ') ━━━━━',
							value: '```\n' + (members_cnt != 0 ? members : '아무도 없습니다.') + '\n```',
						}, {
							name: '남은 시간 ━━━━━━━━',
							value: agoTime(expirationDate, new Date()) + '' + url,
						}]
					}
				});
				msg.delete();

				var interval = setInterval(() => {
					var members = '';
					var members_cnt = 0;
					voiceChannel.members.forEach((value, key, mapObj) => {
						members += (value.nickname != null ? value.nickname : value.user.username) + '\n';
						members_cnt++;
					})

					reply.edit({
						embed: {
							color: 0x3498db,
							author: {
								name: name,
								icon_url: icon_url
							},
							description: description,
							fields: [{
								name: '초대 메시지 ━━━━━━━',
								value: inviteMsg,
							},{
								name: '참가 인원 (' + members_cnt + '/' + voiceChannel.userLimit + ') ━━━━━',
								value: '```\n' + (members_cnt != 0 ? members : '아무도 없습니다.') + '\n```',
							}, {
								name: '남은 시간 ━━━━━━━━',
								value: agoTime(expirationDate, new Date()) + '' + url,
							}]
						}
					}).catch(DiscordAPIError => {
						clearTimeout(timeout);
					});
				}, 5000)

				var timeout = setTimeout(() => {
					clearInterval(interval);
					reply.delete();
				}, maxAge * 1000);
			})
			.catch(console.error);
	} else {
		var reply = await msg.reply('먼저 음성 채널에 연결하세요.');
		setTimeout(() => {
			reply.delete();
			msg.delete();
		}, 3000);
	}
}

exports.career = async (msg, name, getall) => {
	await searchCareer(msg, name, getall, (serverInfoList) => {
		var server_min = null;
		var rankP_min = 1000;
		for (var i = 0; i < serverInfoList.length; i++) {
			if (serverInfoList[i][0] != null) {
				var rankP = (serverInfoList[i][0].ranks.rating / serverInfoList[i][0].max_ranks.rating * 100);
				if (rankP < rankP_min) {
					server_min = serverInfoList[i];
					rankP_min = rankP;
				}
			}
		}

		if (!getall && server_min != null)
			msg.channel.send(careerEmbed(msg, name, server_min));

		if (server_min != null && (msg.member.nickname != null ? msg.member.nickname : msg.member.user.username) == name) {
			var rankP = (server_min[0].ranks.rating / server_min[0].max_ranks.rating * 100).toFixed(2);

			var LvString = [null, 'MEMBER', 'EXPERT', 'LEGEND'];
			var MEMBER = msg.member.roles.has(Settings.role.member);
			var EXPERT = msg.member.roles.has(Settings.role.expert);
			var LEGEND = msg.member.roles.has(Settings.role.legend);
			var prevLv = (MEMBER ? 1 : 0) + (EXPERT ? 1 : 0) + (LEGEND ? 1 : 0);
			var nowLv = 0;

			if (rankP <= 0.5) { //LEGEND
				msg.member.addRole(Settings.role.legend);
				msg.member.addRole(Settings.role.expert);
				msg.member.addRole(Settings.role.member);
				nowLv = 3;
			} else if (rankP <= 4) { //EXPERT
				msg.member.removeRole(Settings.role.legend);
				msg.member.addRole(Settings.role.expert);
				msg.member.addRole(Settings.role.member);
				nowLv = 2;
			} else { //MEMBER
				msg.member.removeRole(Settings.role.legend);
				msg.member.removeRole(Settings.role.expert);
				msg.member.addRole(Settings.role.member);
				nowLv = 1;
			}

			if (prevLv < nowLv)
				msg.channel.send(msg.author + ' 님이 ***' + LvString[prevLv] + '*** 등급에서 ***' + LvString[nowLv] + '*** 등급이 되었습니다.');
			else if (prevLv > nowLv)
				msg.channel.send(msg.author + ' 님이 ***' + LvString[prevLv] + '*** 등급에서 ***' + LvString[nowLv] + '*** 등급으로 강등되었습니다.');

		}

		if (server_min == null)
			msg.channel.send("전적이 없습니다.");
	});
}

async function searchCareer(msg, name, getall, onEnd){
	var reply = await msg.reply("전적 검색중입니다. 잠시만 기다려주세요.");

	request(`https://pubg.op.gg/user/${name}`, (error, response, body) => {
		if (error) throw error;
		var $ = cheerio.load(body);
		var user_id = $('#userNickname').data('user_id');

		var serverInfoList = [
			[krjp1 = null, '2018-02', 'krjp', 1, 'tpp'],
			[krjp2 = null, '2018-02', 'krjp', 2, 'tpp'],
			[krjp4 = null, '2018-02', 'krjp', 4, 'tpp'],
			[as1 = null, '2018-02', 'as', 1, 'tpp'],
			[as2 = null, '2018-02', 'as', 2, 'tpp'],
			[as4 = null, '2018-02', 'as', 4, 'tpp'],
			[as1 = null, '2018-02', 'kakao', 1, 'tpp'],
			[as2 = null, '2018-02', 'kakao', 2, 'tpp'],
			[as4 = null, '2018-02', 'kakao', 4, 'tpp']
		]

		function getCarrer(num) {
			if (num >= serverInfoList.length) {
				onEnd(serverInfoList);
				reply.delete();
				return;
			}

			rp(getURL(user_id, serverInfoList[num])).then((htmlString) => {
				serverInfoList[num][0] = JSON.parse(htmlString);
				if (getall)
					msg.channel.send(careerEmbed(msg, name, serverInfoList[num]));

				getCarrer(num + 1);
			}).catch((err) => {
				getCarrer(num + 1);
			});
		}

		getCarrer(0);

	});
}

function getURL(user_id, serverInfo) {
	return `https://pubg.op.gg/api/users/${user_id}/ranked-stats?season=${serverInfo[1]}&server=${serverInfo[2]}&queue_size=${serverInfo[3]}&mode=${serverInfo[4]}`
}

function careerEmbed(msg, name, serverInfo) {
	var data = serverInfo[0];
	var server = serverInfo[2];
	var queue_size = serverInfo[3];

	return {
		embed: {
			color: [null, 0xe69557, 0x43a5a0, null, 0x6d68ac][queue_size],
			author: {
				name: name,
				icon_url: (msg.member.nickname != null ? msg.member.nickname : msg.member.user.username) == name ? msg.author.avatarURL : null
			},
			title: server + ' / ' + [null, 'solo', 'duo', null, 'squard'][queue_size],
			url: 'https://pubg.op.gg/user/' + name + '?server=' + server,
			fields: [{
				name: '레이팅',
				value: data.stats.rating,
				inline: true
			}, {
				name: '상위 ' + (data.ranks.rating / data.max_ranks.rating * 100).toFixed(2) + '%',
				value: data.ranks.rating + '위',
				inline: true
			}, {
				name: data.stats.matches_cnt + '게임',
				value: '평균 ' + (data.stats.rank_avg).toFixed(2) + '등',
				inline: true
			}, {
				name: ':poultry_leg: ' + data.stats.win_matches_cnt + ' 번 (' + (data.stats.win_matches_cnt / data.stats.matches_cnt * 100).toFixed(2) + '%)',
				value: '탑 10 : ' + data.stats.topten_matches_cnt + ' 번 (' + (data.stats.topten_matches_cnt / data.stats.matches_cnt * 100).toFixed(2) + '%)',
				inline: true
			}, {
				name: (data.stats.kills_sum / data.stats.deaths_sum).toFixed(2) + ' K/D',
				value: ((data.stats.kills_sum + data.stats.assists_sum) / data.stats.deaths_sum).toFixed(2) + ' KDA',
				inline: true
			}, {
				name: '최다 킬 : ' + data.stats.kills_max,
				value: '평균 데미지 : ' + data.stats.damage_dealt_avg.toFixed(0),
				inline: true
			}],
			footer: {
				text: 'pubg.op.gg'
			}
		}
	};
}

function dateToString(date) {
	return moment(date).format('YYYY-MM-DD hh:mm:ss');
}

function agoTime(date1, date2) {
	date1_ms = date1.getTime();
	date2_ms = date2.getTime();
	var tmp = date1_ms - date2_ms;
	tmp = tmp / 1000;
	var seconds = Math.floor(tmp % 60);
	tmp = tmp / 60;
	var minutes = Math.floor(tmp % 60);
	tmp = tmp / 60;
	var hour = Math.floor(tmp % 24);
	var days = Math.floor(tmp / 24);

	var diffTimeStr = '';

	if (days == 0) {
		if (hour == 0) {
			if (minutes == 0) {
				diffTimeStr = `${seconds} 초`;
			} else {
				diffTimeStr = `${minutes} 분 ${seconds} 초`;
			}
		} else {
			diffTimeStr = `${hour} 시간 ${minutes} 분 ${seconds} 초`;
		}
	} else {
		diffTimeStr = `${days} 일 ${hour} 시 ${minutes} 분 ${seconds} 초`;
	}

	return diffTimeStr;
}
