const DDG = require('duck-duck-scrape');

async function searchDuckDuckGo(query) {
  searchQuery = 'Youtube Video' + query + 'Audio';
  const searchResults = await DDG.search(searchQuery, {
    safeSearch: DDG.SafeSearchType.STRICT
  });

  return searchResults['results'][0]['url'];
}

module.exports = searchDuckDuckGo;