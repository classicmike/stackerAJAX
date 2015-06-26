$(document).ready( function() {
	$('.unanswered-getter').submit( function(event){
		// zero out results if previous search has run
		emptyResults();
		// get the value of the tags the user submitted
		var tags = $(this).find("input[name='tags']").val();
		getUnanswered(tags);
	});

    $(INSPIRATION_GETTER_SELECTOR).submit(processInspirationSubmit.bind(null));
});

var emptyResults = function(){
    $('.results').html('');
};


// this function takes the question object returned by StackOverflow 
// and creates new result to be appended to DOM
var showQuestion = function(question) {
	
	// clone our result template code
	var result = $(QUESTIONS_SELECTOR).clone();
	
	// Set the question properties in result
	var questionElem = result.find('.question-text a');
	questionElem.attr('href', question.link);
	questionElem.text(question.title);

	// set the date asked property in result
	var asked = result.find('.asked-date');
	var date = new Date(1000*question.creation_date);
	asked.text(date.toString());

	// set the #views for question property in result
	var viewed = result.find('.viewed');
	viewed.text(question.view_count);

	// set some properties related to asker
	var asker = result.find('.asker');
	asker.html('<p>Name: <a target="_blank" href=http://stackoverflow.com/users/' + question.owner.user_id + ' >' +
													question.owner.display_name +
												'</a>' +
							'</p>' +
 							'<p>Reputation: ' + question.owner.reputation + '</p>'
	);

	return result;
};

var showAnswerer = function(answerer){
    var resultHTML = $(ANSWERER_SELECTOR).clone();
    var user = answerer.user;
    resultHTML.find(USERNAME_SELECTOR).text(user.display_name);
    resultHTML.find(REPUTATION_SELECTOR).text(user.reputation);
    resultHTML.find(SCORE_SELECTOR).text(result.score);
};

var processInspirationSubmit = function(event){
    var inputElement = $(event.target);
    emptyResults();
    var tags = inputElement.find(ANSWERERS_INPUT_SELECTOR).val();

    getInspiration(tags);
};


var getInspiration = function(tags){
    console.log(tags);

    var result  = $.get({
        url: ANSWERERS_API_URL + '/tags/' + tags + '/top-answerers/' + ALL_TIME_PARAMETER + '?site=' + STACK_OVERFLOW
    }).done(processAnswerersResults.bind(null, tags))
    .fail(processError.bind(null));

};

var processAnswerersResults = function(tag, result){
    var items = result.items;
    var resultNumber = items.length;

    showSearchResults(tag, resultNumber);

    for(var i =0; i < items.length; i++){
        var item = items[i];

        var answererHTML = showAnswerer(answerer);
        renderResult(answererHTML);
    }
};

var processError = function(jqXHR, error, errorThrown){
    var errorElem = showError(error);
    $(SEARCH_RESULTS_SELECTOR).append(errorElem);
};


// this function takes the results object from StackOverflow
// and creates info about search results to be appended to DOM
var showSearchResults = function(query, resultNum) {
	var results = resultNum + ' results for <strong>' + query;
	return results;
};

var renderResult = function(html){
    $(RESULTS_SELECTOR).append(html);
};

// takes error string and turns it into displayable DOM element
var showError = function(error){
	var errorElem = $('.templates .error').clone();
	var errorText = '<p>' + error + '</p>';
	errorElem.append(errorText);
};

// takes a string of semi-colon separated tags to be searched
// for on StackOverflow
var getUnanswered = function(tags) {
	
	// the parameters we need to pass in our request to StackOverflow's API
	var request = {tagged: tags,
								site: 'stackoverflow',
								order: 'desc',
								sort: 'creation'};
	
	var result = $.ajax({
		url: "http://api.stackexchange.com/2.2/questions/unanswered",
		data: request,
		dataType: "jsonp",
		type: "GET",
		})
	.done(function(result){
		var searchResults = showSearchResults(request.tagged, result.items.length);

		$('.search-results').html(searchResults);

		$.each(result.items, function(i, item) {
			var question = showQuestion(item);
			$('.results').append(question);
		});
	})
	.fail(function(jqXHR, error, errorThrown){
		var errorElem = showError(error);
		$('.search-results').append(errorElem);
	});
};

var ANSWERER_SELECTOR = '#templates .answerer';
var QUESTIONS_SELECTOR = '#templates .question';
var INSPIRATION_GETTER_SELECTOR = '#inspiration-getter';
var RESULTS_SELECTOR = '#results';
var ANSWERERS_INPUT_SELECTOR = 'input[name="answerers"]';
var STACK_OVERFLOW =  'stackoverflow';
var ALL_TIME_PARAMETER =  'all_time';
var ANSWERERS_API_URL = 'http://api.stackexchange.com/2.2/';
var SEARCH_RESULTS_SELECTOR = '.search-results';
var USERNAME_SELECTOR = '.username';
var REPUTATION_SELECTOR = '.reputation';
var SCORE_SELECTOR = '.score';


