let axios = require('axios');
var movieQueue = [];
var tvQueue = [];

var apiKey = '606aaffd7ca10f0b80804a1f0674e4e1';
var discover = 'https://api.themoviedb.org:443/3/discover';

var tv = 'https://api.themoviedb.org:443/3/tv';
var startTV = 'air_date.gte=2017-12-01';
var endTV = 'air_date.lte=2017-12-31';

var movie = 'https://api.themoviedb.org:443/3/movie';
var startMovie = 'primary_release_date.gte=2017-12-01';
var endMovie = 'primary_release_date.lte=2017-12-31';

var moviePages = 0,
    movieResults = 0,
    movieRequests = 0;

var tvPages = 0,
    tvResults = 0,
    tvRequests = 0;

var requests = 0;

var mixMovie = new Set([]);
var mixTV = new Set([]);
var mix = new Set([]);

let pageCount = 1;

// Call to fetch the number of pages and requests have to be made
axios
    .all([discover + '/movie?' + startMovie + '&' + endMovie + '&api_key=' + apiKey + '&page=1', 
    discover + '/tv?' + startTV + '&' + endTV + '&api_key=' + apiKey + '&page=1'].map(l => axios.get(l)))
    .then(axios.spread(function (movieResponse, tvResponse) {
        movieResults = movieResponse.data.total_results;
        moviePages = movieResponse.data.total_pages;
        movieRequests = movieResults + moviePages;
        
        tvResults = tvResponse.data.total_results;
        tvPages = tvResponse.data.total_pages;
        tvRequests = tvResults + tvPages;

        requests = tvRequests + movieRequests;
    }))
    .then(response => {
        //console.log("Results: ", movieResults, " ", tvResults);
        //console.log("Pages: ", moviePages, " ", tvPages);
        console.log('Total Requests: ', " ", movieRequests, "+", tvRequests, " ", requests);
        initiate();
    })
    .catch(error => {
        console.log(error);
    });

// Initiate the process
var initiate = function() {
    for (let i = 1; i <= moviePages; i++) {
        let resolve, reject;
        let path = discover + '/movie?' + startMovie + '&' + endMovie + '&api_key=' + apiKey + '&page=' + i;
        const promise = new Promise((qResolve, qReject) => {
            resolve = qResolve;
            reject = qReject;
        });
        movieQueue.push({
            path,
            resolve,
            reject
        });
    }

    for (let i = 1; i <= tvPages; i++) {
        let resolve, reject;
        let path = discover + '/tv?' + startTV + '&' + endTV + '&api_key=' + apiKey + '&page=' + i;
        const promise = new Promise((qResolve, qReject) => {
            resolve = qResolve;
            reject = qReject;
        });
        tvQueue.push({
            path,
            resolve,
            reject
        });
    }
    startFunction();
};

// Start by fetching movie casts
var startFunction = function() {
    refreshIntervalId = setInterval(getMovieCasts, 10000);
}

var getMovieCasts = function() {
    axios
    .get(movieQueue.shift().path).then(resolve => {
        console.log("PageCount: ", pageCount++);
        if (resolve.data && resolve.data.results) {
            let movieIds = resolve.data.results.map(x => x.id);
            axios.all(movieIds.map(x => axios.get(movie + '/' + x + '/credits?api_key=' + apiKey)))
            .then(axios.spread(function (...res) {
                var movieCasts = res.map(x => x.data.cast);
                for(let i = 0; i < movieCasts.length; i++) {
                    for(let j = 0; j < movieCasts[i].length; j++) {
                        mixMovie.add(movieCasts[i][j]['id']);
                    }
                }
            }))
            .catch(reject => {});
        }
        
        if(movieQueue.length === 0) {
            clearInterval(refreshIntervalId);
            jumpToTVCasts();
        }
    }).catch(reject => {console.log(reject)});
}

// Jump to start fetching tv casts.
var jumpToTVCasts = function() {
    refreshIntervalId = setInterval(getTVCasts, 10000);
}

var getTVCasts = function() {
    axios
    .get(tvQueue.shift().path).then(resolve => {
        console.log("PageCount: ", pageCount++);
        if (resolve.data && resolve.data.results) {
            let tvIds = resolve.data.results.map(x => x.id);
            axios.all(tvIds.map(x => axios.get(tv + '/' + x + '/credits?api_key=' + apiKey)))
            .then(axios.spread(function (...res) {
                var tvCasts = res.map(x => x.data.cast);
                for(let i = 0; i < tvCasts.length; i++) {
                    for(let j = 0; j < tvCasts[i].length; j++) {
                        mixTV.add(tvCasts[i][j]['id']);
                    }
                }
            }))
            .catch(reject => {});
        }
    })
    .then(response => {
        // Intersection of movie casts set and tv casts set
        if(tvQueue.length === 0) {
            mix = new Set([...mixMovie].filter(x => mixTV.has(x)));
            console.log("Results: ", mix.size);
            clearInterval(refreshIntervalId);    
        }
    })
    .catch(reject => {console.log(reject)});
}