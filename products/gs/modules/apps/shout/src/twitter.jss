function doGet(request, response, session) {
	var twitter = new TwitterConnect("d0CTc4Zg9pufCnMkteDc7w",
			"z4FMZhP87U5QEwycggDe5JN6TDDh7xEyhnAcEpdWk");
	var accessToken = request.getParameter('atoken');
	var share = request.getParameter('share');
	var test = request.getParameter('test');
	var loadback = request.getParameter('loadback');

	// post by shouter
	if (share != null) {
		var atkn;
		atkn = session.get('atoken');
		twitter.setAccessToken(atkn);
		response.write(atkn);
		var requestParams1 = {
			status : '' + share
		};
		twitter.createOAuthRequest(
				"http://api.twitter.com/1/statuses/update.json?", "POST",
				requestParams1)
		response.write(share);

		var rbody = twitter.getResponseBody();
		response.write(rbody);
	}

	// load back called again xml from twitter
	if (loadback != null) {
		var atkn;
		atkn = session.get('atoken');
		twitter.setAccessToken(atkn);
		response.write(atkn);
		var requestParams = {
			count : '10'
		};
		twitter
				.createOAuthRequest(
						"https://api.twitter.com/1/statuses/home_timeline.xml?include_entities=true",
						"GET", requestParams)

		var rbody = twitter.getResponseBody();
		response.write(rbody);
	}

	// for testing token params in url mode
	if (test != null) {
		response.write("Test is Called");
		if (session.get('atoken') != null) {
			var accessToken = request.getParameter('atoken');
			response.write("acess token from session " + accessToken + "::"
					+ twitter.getRequestToken());
		}
	}
	// if not session not authorized
	if (session.get('rtoken') == null || accessToken == null) {
		session.put('rtoken', twitter.getRequestToken());
		var authUrl = twitter.getAuthorizationUrl();
		response.write(authUrl);
	} else {
		// setting Request key from session
		twitter.setRequestToken(session.get('rtoken'));
		var accessToken = request.getParameter('atoken');
		var atkn;

		if (session.get('atoken') == null) {
			atkn = twitter.getAccessToken(accessToken);
			session.put('atoken', atkn);
		} else {
			atkn = session.get('atoken');
			twitter.setAccessToken(atkn);

		}

		// getting status of time line of user
		var requestParams = {
			count : '20'
		};
		twitter
				.createOAuthRequest(
						"https://api.twitter.com/1/statuses/home_timeline.xml?include_entities=true",
						"GET", requestParams)
		var rbody = twitter.getResponseBody();
		response.write("r body" + rbody);
	}

}
