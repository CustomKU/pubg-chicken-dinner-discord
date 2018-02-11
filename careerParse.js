var data = [{
	rating: -1,
	rank: -1,
	rankP: -1,
	gameN: 0,
	winN: 0,
	topN: 0,
	winP: -1,
	topP: -1,
	kd: -1,
	kda: -1,
	damage: -1,
	avgRank: -1
}, {
	rating: -1,
	rank: -1,
	rankP: -1,
	gameN: 0,
	winN: 0,
	topN: 0,
	winP: -1,
	topP: -1,
	kd: -1,
	kda: -1,
	damage: -1,
	avgRank: -1
}, {
	rating: -1,
	rank: -1,
	rankP: -1,
	gameN: 0,
	winN: 0,
	topN: 0,
	winP: -1,
	topP: -1,
	kd: -1,
	kda: -1,
	damage: -1,
	avgRank: -1
}];

regexp = /[ <>,%/_=#\n\"a-zA-Z가-힣]/g;

$(".ranked-stats-wrapper__card").each(function(i) {
	if (i < 3) {
		data[i]['rating'] = parseInt($(this).find(".ranked-stats__rating-point").html().replace(regexp, ""));
		data[i]['rank'] = parseInt($(this).find(".ranked-stats__rank").html().replace(regexp, ""));
		data[i]['rankP'] = parseFloat($(this).find(".ranked-stats__rate").html().replace(regexp, ""));
		data[i]['gameN'] = parseInt($(this).find(".ranked-stats__games-count").html().replace(regexp, ""));
		var winN_HTML = $(this).find(".ranked-stats__win").html();
		if (winN_HTML != null)
			data[i]['winN'] = parseInt(winN_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var topN_HTML = $(this).find(".ranked-stats__top10").html();
		if (topN_HTML != null)
			data[i]['topN'] = parseInt(topN_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var winP_HTML = $(this).find(".ranked-stats__value").eq(2).html();
		if (winP_HTML != null)
			data[i]['winP'] = parseFloat(winP_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var topP_HTML = $(this).find(".ranked-stats__value").eq(3).html();
		if (topP_HTML != null)
			data[i]['topP'] = parseFloat(topP_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var kd_HTML = $(this).find(".ranked-stats__value").eq(0).html();
		if (kd_HTML != null)
			data[i]['kd'] = parseFloat(kd_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var kda_HTML = $(this).find(".ranked-stats__value").eq(8).html();
		if (kda_HTML != null)
			data[i]['kda'] = parseFloat(kda_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var damage_HTML = $(this).find(".ranked-stats__value").eq(1).html();
		if (damage_HTML != null)
			data[i]['damage'] = parseInt(damage_HTML.replace(/<.*>/g, "").replace(regexp, ""));

		var avgRank_HTML = $(this).find(".ranked-stats__value").eq(6).html();
		if (avgRank_HTML != null)
			data[i]['avgRank'] = parseFloat(avgRank_HTML.replace(/<.*>/g, "").replace(regexp, ""));

	}
});
