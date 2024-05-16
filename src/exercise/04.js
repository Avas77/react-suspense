// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}
// 🐨 create a pokemonResourceCache object

const PokemonResourceContext = React.createContext()

function PokemonResourceContextProvider({children}) {
  const cache = React.useRef({})

  const getPokemonResource = React.useCallback(name => {
    let resource = cache.current[name]
    if (!resource) {
      resource = createPokemonResource(name)
      cache.current[name] = resource
    }
    return resource
  }, [])

  return (
    <PokemonResourceContext.Provider value={getPokemonResource}>
      {children}
    </PokemonResourceContext.Provider>
  )
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const getPokemonResource = React.useContext(PokemonResourceContext)
  console.log(getPokemonResource)
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      // 🐨 change this to getPokemonResource instead
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <PokemonResourceContextProvider>
      <div className="pokemon-info-app">
        <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
        <hr />
        <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
          {pokemonResource ? (
            <PokemonErrorBoundary
              onReset={handleReset}
              resetKeys={[pokemonResource]}
            >
              <React.Suspense
                fallback={<PokemonInfoFallback name={pokemonName} />}
              >
                <PokemonInfo pokemonResource={pokemonResource} />
              </React.Suspense>
            </PokemonErrorBoundary>
          ) : (
            'Submit a pokemon'
          )}
        </div>
      </div>
    </PokemonResourceContextProvider>
  )
}

export default App
