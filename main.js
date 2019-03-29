// Variable declarations
const search = {
    term: '',
    media: '',
    sorter: '',
}
let results = []
const terms = qs('.terms')
const submit = qs('.enter')
const sorters = {'genre': genreSort}

// Classes for data retreival, storage, and element creation
class artist {
    constructor(name, genre) {
        this.name = name
        this.genre = genre
        this.element = document.createElement('div')
    }

    getElement() {
        this.element.innerHTML = `<p>${this.name}</p><p>${this.genre}</p>`
    }
}

class album {
    constructor(name, artist, genre, trackNum, picture) {
        self.name = name
        self.artist = artist
        self.genre = genre
        self.trackNum = trackNum
        self.picture = picture
    }
}

class song {
    constructor(title, genre, artist, date, preview) {
        this.title = title
        this.genre = genre
        this.artist = artist
        this.date = date
        this.preview = preview
        this.element = document.createElement('div')
    }

    getElement() {
        this.element.innerHTML = `<p>${this.title}</p><p>${this.genre}</p><p>${this.artist}</p><p>${this.date}</p><audio controls src="${this.preview}" type="audio/mp3">`
    }
}

// Utility functions
function qs (selector) {
    return document.querySelector(selector)
}

function qsa (selector) {
    return document.querySelectorAll(selector)
}

function getURL(search) {
    return `term=${encodeURIComponent(search.term)}&media=music&entity=${search.media}`
}

// Functions to sort the results array in different ways, once it has been populated
function genreSort(a, b) {
    let genreA = a.genre
    let genreB = b.genre
    if (genreA < genreB) {return -1}
    if (genreB < genreB) {return 1}
}

// Functions to create members of the data classes given a JSON response
// Stores the objects in the 'results' array
function makeArtists(response) {
    for (let result of response.results) {
        result = new artist(result.artistName, result.primaryGenreName)
        results.push(result)
    }
    return results
}

function makeAlbums(response) {}

function makeSongs(response) {
    for (let result of response.results) {
        result = new song(result.trackName, result.primaryGenreName, result.artistName, result.releaseDate, result.previewUrl)
        results.push(result)
    }
    return results
}

// Determines which object creation function to use on the JSON response, given the search terms
function makeResults(search, response) {
    if (search.media === 'song') {
        return makeSongs(response)
    } else if (search.media === 'album') {
        return makeAlbums(response)
    } else {
        return makeArtists(response)
    }
}

// Uses getURL to construct the fetch request, passing the JSON data to makeResults
function getResults (input) {
    return fetch(`https://itunes-api-proxy.glitch.me/search?${input}`)
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response.json()
        })
        .then(function(json) {
            makeResults(search, json)
            return results
        })
}

// Event listener that puts the whole operation into motion
submit.addEventListener('click', function () {
    search.term = terms.value
    search.media = qs('input[name="type"]:checked').value
    search.sorter = qs('input[name="sorter"]:checked').value

    getResults(getURL(search))
    .then(function (response) {
        results = []
        qs('.results').innerHTML = ''
        for (let result of response) {
            result.getElement()
            results.push(result)   
        }

        results.sort(function sort(a, b) {
            return sorters[search.sorter](a, b)
        })

        for (let result of results) {
            qs('.results').appendChild(result.element)
        }
    })
})
