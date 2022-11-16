const container = document.querySelector('.main-container')
const search = document.getElementById('search')
const generationSelector = document.getElementById('generation')
const regex = /\d+/g
let pokemonArray = []
let pokemonFetchLength = 0
let flipper = 0

generationSelector.addEventListener('change', preparePokemon)

async function getGeneration() {
  try {
    const request = await fetch(`https://pokeapi.co/api/v2/generation/${generationSelector.value}`)
    const response = await request.json()
    pokemonFetchLength = response.pokemon_species.length
    return response
  } catch (error) {
    console.log(`Error Caught: ${error}`);
  }
}

async function getPokemon(obj) {
  console.log(obj);
  obj.pokemon_species.forEach((pokemon) => {
    let pokemonID = pokemon.url.slice(41).match(regex)[0]

    try {
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonID}/`)
      .then((res) => res.json())
      .then((obj) => {
        pokemonArray.push(obj)
      })
    } catch (error) {
      console.log(`Error Caught: ${error}`)
    }
  })

  return true
}

async function preparePokemon() {
  container.textContent = ''
  pokemonArray = []

  try {    
    const generation = await getGeneration()
    getPokemon(generation)
    waitForResults()
  } catch (error) {
    console.log(`Error Caught: ${error}`)
  }
}

function sortPokemon(arr) {
  console.log('Sorting');
  arr.sort((a, b) => {
    return a.order - b.order
  })
}

function waitForResults() {
  if (pokemonArray.length !== pokemonFetchLength) {
    flipper++
    console.log(`Flipper: ${flipper}`);
    timeout = setTimeout(waitForResults, 250);
    return false
  } else if (flipper === 5) {
    throw `Request timed out after ${flipper} tries.`
  } else {
    sortPokemon(pokemonArray)
    displayPokemon(pokemonArray)
    clearTimeout(timeout)
    return true
  }
}

function displayPokemon(arr) {
  arr.forEach((pokemon) => {
    const div = document.createElement('div')
    const image = document.createElement('img')
    const imageURL = pokemon.sprites.front_default
  
    div.textContent = pokemon.name[0].toUpperCase() + pokemon.name.substring(1)
    image.src = imageURL
  
    container.appendChild(div)
    container.appendChild(image)
  })
}

preparePokemon()