exports.run = (msg, content) => {
	if (exports.messagelist[content])
		msg.channel.send(exports.messagelist[content]);
};
exports.messagelist = {
	'안녕하세요': '반갑습니다',
	'ㅂㅇㄹ': '가조쿠?'

};
