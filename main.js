// Variable declarations
const search = {
    term: '',
    media: '',
    sorter: '',
}
let results = []
const terms = qs('.terms')
const submit = qs('.enter')
const sorters = {'genre': genreSort, 'date': dateSort, 'relevance': nullSort}

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

// Classes for data retreival, storage, and element creation
class artist {
    constructor(name, genre) {
        this.name = name
        this.genre = genre
        this.element = document.createElement('div')
        this.element.classList.add('result')
    }

    getElement() {
        this.element.innerHTML = `<p>${this.name}</p><p>${this.genre}</p>`
    }
}

class album {
    constructor(name, artist, genre, trackNum, picture, date) {
        this.name = name
        this.artist = artist
        this.genre = genre
        this.trackNum = trackNum
        this.picture = document.createElement('img')
        this.picture.setAttribute('src', picture)
        this.date = date
        this.element = document.createElement('div')
        this.element.classList.add('result')
        this.mediaHolder = document.createElement('div')
        this.mediaHolder.appendChild(this.picture)
        this.mediaHolder.classList.add('image')
    }

    getElement() {
        this.element.appendChild(this.mediaHolder)
        this.mediaHolder.insertAdjacentHTML('afterend', `<p class="first"><span class="label">Title:</span> ${this.name}</p><p><span class="label">Name:</span> ${this.artist}</p><p><span class="label">Genre:</span> ${this.genre}</p><p><span class="label">Release date:</span> ${moment(this.date).format('MMMM Do YYYY')}</p><p><span class="label">Number of songs:</span> ${this.trackNum}</p>`)
    }
}

class song {
    constructor(title, genre, artist, date, preview, picture, album) {
        this.title = title
        this.genre = genre
        this.artist = artist
        this.date = date
        this.album = album
        this.preview = new Audio(`${preview}`)
        this.preview.setAttribute('id', `${preview}`)
        this.mediaHolder = document.createElement('div')
        this.picture = document.createElement('img')
        this.picture.setAttribute('data', `${preview}`)
        this.picture.setAttribute('src', picture)
        this.mediaHolder.classList.add('image')
        this.mediaHolder.appendChild(this.picture)
        this.mediaHolder.appendChild(this.preview)
        this.element = document.createElement('div')
        this.element.classList.add('result')
    }

    getElement() {
        this.element.appendChild(this.mediaHolder)
        this.mediaHolder.insertAdjacentHTML('afterend', `<div>${this.picture.innerHTML}</div><p class="first"><span class="label">Title:</span> ${this.title}</p><p><span class="label">Album:</span> ${this.album}</p><p><span class="label">Artist:</span> ${this.artist}</p><p><span class="label">Genre:</span> ${this.genre}</p><p><span class="label">Released:</span> ${moment(this.date).format('MMMM Do YYYY')}</p>`)
    }
}

// Handles playing and pausing previews
document.addEventListener('click', function(event) {
    if (event.target.nodeName === 'IMG') {     
        let id = event.target.getAttribute('data')
        let player = document.getElementById(id)
        if (player.hasAttribute('controls')) {
            if (player.paused) {
                player.play()
            } else {player.pause()}
        }
        else {
            let oldPlayer = qs('[controls]')
            if (oldPlayer) {
                oldPlayer.pause()
                oldPlayer.removeAttribute('controls')
            }
            player.setAttribute('controls', null)
            player.play()
        } 
    } 
})

// Functions to sort the results array in different ways, once it has been populated
function genreSort(a, b) {
    let genreA = a.genre
    let genreB = b.genre
    if (genreA < genreB) {return -1}
    if (genreB < genreB) {return 1}
}

function dateSort(a, b) {
    let dateA = new Date(a.date)
    let dateB = new Date(b.date)
    return dateB - dateA
}

function nullSort(a, b) {
}

// Functions to create members of the data classes given a JSON response
// Stores the objects in the 'results' array
function makeArtists(json) {
    results = []
    for (let result of json.results) {
        result = new artist(result.artistName, result.primaryGenreName)
        result.getElement()
        results.push(result)
    }
    return results
}

function makeAlbums(json) {
    results = []
    for (let result of json.results) {
        result = new album(result.collectionName, result.artistName, result.primaryGenreName, result.trackCount, result.artworkUrl100, result.releaseDate)
        result.getElement()
        results.push(result)
    }
    return results
}

function makeSongs(json) {
    results = []
    for (let result of json.results) {
        result = new song(result.trackName, result.primaryGenreName, result.artistName, result.releaseDate, result.previewUrl, result.artworkUrl100, result.collectionName)
        result.getElement()
        results.push(result)
    }
    return results
}

// Determines which object creation function to use on the JSON response, given the search terms
function makeResults(search, json) {
    if (search.media === 'song') {
        return makeSongs(json)
    } else if (search.media === 'album') {
        return makeAlbums(json)
    } else {
        return makeArtists(json)
    }
}

// Pairs with getURL to construct the fetch request, passing the JSON data to makeResults
function getResults (input) {
    return fetch(`https://itunes-api-proxy.glitch.me/search?${input}`)
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText)
            }
            return response.json()
        })
        .then(function(json) {
            return makeResults(search, json)
        })
}

// Event listener that puts the whole operation into motion
submit.addEventListener('click', function () {
    search.term = terms.value
    search.media = qs('input[name="type"]:checked').value
    search.sorter = qs('input[name="sorter"]:checked').value

    getResults(getURL(search))
    .then(function (response) {
        qs('.results').innerHTML = ''

        response.sort(function sort(a, b) {
            return sorters[search.sorter](a, b)
        })

        for (let result of response) {
            qs('.results').appendChild(result.element)
        }
    })
})
