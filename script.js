const container = document.querySelector('.main-container')
const pokemonTemplate = document.querySelector('[data-pokemon-template]')
const pokemonTemplateContainer = document.querySelector('[data-pokemon-container]')
const search = document.getElementById('search')
const generationSelector = document.getElementById('generation')
const regex = /\d+/g
// Add caching instead of just clearing array in step 3
// Maybe add lazy loading for images on scroll down
const pokemonCache = []
const pokemonFetchLength = []
const pokemonSearchArray = []
let allPokemon
let pokemonArray = []
let flipper = 0

generationSelector.addEventListener('change', preparePokemon)

// When searchbar empty on unfocus, show current generation
search.addEventListener('blur', e => {
  const text = e.target.value
  const oldPokemon = document.querySelectorAll('.pokemon')

  if (text === '') {
    const oldPokemon = document.querySelectorAll('.pokemon')
    const searchPokemon = document.querySelectorAll('[data-pokemon-container]')
  
    if (oldPokemon.length > 0) {    
      oldPokemon.forEach(container => {
        container.classList.remove('hidden')
      })
    }
  
    if (searchPokemon.length > 0) {    
      searchPokemon.forEach(container => {
        container.classList.add('hidden')
      })
    }
  }
})

// Credit to Web Dev Simplified
search.addEventListener('input', e => {
  const text = e.target.value.toLowerCase()
  const oldPokemon = document.querySelectorAll('.pokemon')
  const searchPokemon = document.querySelectorAll('[data-pokemon-container]')

  if (oldPokemon.length > 0) {    
    oldPokemon.forEach(container => {
      container.classList.add('hidden')
    })
  }

  if (searchPokemon.length > 0) {    
    searchPokemon.forEach(container => {
      container.classList.remove('hidden')
    })
  }

  pokemonSearchArray.forEach(pokemon => {
    const visible = pokemon.name.toLowerCase().includes(text)
    pokemon.element.classList.toggle("hidden", !visible)
  })
})

async function getAllPokemon() {
  try {
    const request = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000')
    const response = await request.json()
    allPokemon = response.results
    clonePokemonNodes()
    return response
  } catch (error) {
    console.log(`Error getting all pokemon: ${error}`);
  }
}

// Fetch amount of pokemon in each generation
async function getGeneration() {
  try {
    for (let i = 1; i < generationSelector.length + 1; i++) {
      const request = await fetch(`https://pokeapi.co/api/v2/generation/${i}`)
      const response = await request.json()
      pokemonFetchLength.push(response.pokemon_species.length)
    }
    return true
  } catch (error) {
    console.log(`Error Caught: ${error}`);
  }
}

// Fetch pokemon by their ids
async function getPokemon(num) {
  for (let i = num - pokemonFetchLength[generationSelector.value - 1]; i < num; i++) {
    try {
      fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`)
      .then((res) => res.json())
      .then((obj) => {
        pokemonArray.push(obj)
      })
    } catch (error) {
      console.log(`Error Caught: ${error}`)
    }
  }
  return true
}

// Begin Point
async function preparePokemon() {
  if (checkCache()) {
    return true
  }
  if (pokemonFetchLength.length === 0) {
    await getGeneration()
  }

  try {
    const searchPokemon = document.querySelectorAll('[data-pokemon-container]')
    const oldPokemon = document.querySelectorAll('.pokemon')

    // Remove old pokemon
    if (oldPokemon.length > 0) {    
      oldPokemon.forEach(container => {
        container.remove()
      })
    }

    // Hide search names
    if (searchPokemon.length > 0) {    
      searchPokemon.forEach(container => {
        container.classList.add('hidden')
      })
    }
    cachePokemon()
    getPokemon(reduceNumber(generationSelector.value))
    waitForResults()
  } catch (error) {
    console.log(`Error Caught: ${error}`)
  }
}

// Sort pokemon by pokemon.id
function sortPokemon(arr) {
  arr.sort((a, b) => {
    return a.id - b.id
  })
}

// End up here if no cache
function waitForResults() {
  try {
    if (pokemonArray.length !== pokemonFetchLength[generationSelector.value - 1]) {
      flipper++
      if (flipper > 4) {
        throw `Request timed out after ${flipper} tries.`
      }
      console.log('Loading...');
      timeout = setTimeout(waitForResults, 1000);
      return false
    } else {
      flipper = 0
      sortPokemon(pokemonArray)
      displayPokemon(pokemonArray)
      clearTimeout(timeout)
      return true
    }
  } catch (error) {
    console.log(error);
  }
}

// Creates elements with info from pokemon objects and appends to container
function displayPokemon(arr) {
  arr.forEach((pokemon) => {
    const div = document.createElement('div')
    const innerDiv = document.createElement('div')
    const textDiv = document.createElement('div')
    const imageAnchor = document.createElement('a')
    const image = document.createElement('img')
    const imageURL = pokemon.sprites.front_default
  
    textDiv.textContent = pokemon.name[0].toUpperCase() + pokemon.name.substring(1)
    div.classList.add('pokemon')
    innerDiv.classList.add('pokemon-inner')

    image.src = imageURL
    imageAnchor.appendChild(image)
    imageAnchor.appendChild(textDiv)
    imageAnchor.href = `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}_(Pok%C3%A9mon)`
    imageAnchor.setAttribute('rel', 'noopener noreferrer')
    imageAnchor.setAttribute('target', '_blank')

    innerDiv.appendChild(imageAnchor)
  
    div.appendChild(innerDiv)

    container.appendChild(div)
  })
}

// Add up generation numbers to specified index
function reduceNumber(index, arr = pokemonFetchLength) {
  if (index > 0) {
    const filtered = arr.slice(0, index)

    return filtered.reduce((prev, curr) => {
      return prev + curr
    }, 1)
  
  } else {
    return arr[0]
  }
}

// Pushes into cache if pokemonArray not empty and generation is not already in cache
function cachePokemon() {
  const generation = checkPokemonGeneration
  const exists = checkCacheExists

  if (generation() && exists()) {
    pokemonCache.push([checkPokemonGeneration(), pokemonArray])
    pokemonArray = []
  } else {
    pokemonArray = []
  }
}

// Check generation of first pokemon if pokemonArray not empty
function checkPokemonGeneration(arr=pokemonArray) {
  if (pokemonArray.length !== 0) {
    let id = arr[0].id
    let generation
  
    for (let i = 0; i < pokemonFetchLength.length; i++) {
      if (id < reduceNumber(i)) {
        if (i === 0) {
          generation = 1
          return generation
        } else {
          generation = i
          return generation
        }
      }
    }
  }

  return false
}

// Check if cache already in pokemonCache
function checkCacheExists(arr=pokemonCache) {
  // Check cache empty
  if (pokemonCache.length === 0) {
    return true
  }
  // Check cache generation numbers
  for (let i = 0; i < arr.length; i++) {
    const node = arr[i];
    if (node[0] === checkPokemonGeneration()) {
      return false
    }
  }
  return true
}

// Check if cache has generation selected, if so then load
function checkCache(arr=pokemonCache) {
  if (arr.length !== 0) {
    arr.forEach((generation, index) => {
      if (generation[0] === Number(generationSelector.value)) {
        console.log('Loading from cache');
        displayPokemon(generation[1])
        return true
      }
    })
  }
  return false
}

function clonePokemonNodes() {
  allPokemon.forEach(pokemon => {
    const template = pokemonTemplate.content.cloneNode(true).children[0]
    const url = template.querySelector('[data-pokemon-url]')
    url.textContent = pokemon.name[0].toUpperCase() + pokemon.name.slice(1)
    url.href = `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}_(Pok%C3%A9mon)`
    template.classList.add('hidden')

    container.append(template)
    pokemonSearchArray.push({ name: pokemon.name, url: pokemon.url, element: template })
  })
}

getAllPokemon()
preparePokemon()