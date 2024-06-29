import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface PokemonData {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  names: Array<{
    name: string;
    language: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  types: Array<{
    type: {
      name: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

interface NikkeData {
  name: string;
  rarity: string;
  element: string;
  weapon: string;
  class: string;
  skills: Array<{
    name: string;
    description: string;
  }>;
  images: {
    icon: string;
    card: string;
    full: string;
  };
}

const App: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [nikke, setNikke] = useState<NikkeData | null>(null);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [loadingNikke, setLoadingNikke] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchRandomPokemon = async () => {
    setLoadingPokemon(true);
    try {
      const randomId = Math.floor(Math.random() * 898) + 1; // Pokémon ID ranges from 1 to 898
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      setPokemon(response.data);
    } catch (error) {
      console.error('Error fetching the Pokémon data', error);
    } finally {
      setLoadingPokemon(false);
    }
  };

  const fetchNikke = async (nikkeName: string) => {
    setLoadingNikke(true);
    try {
      const response = await axios.get(`https://nikke-api.vercel.app/characters/${nikkeName}`);
      setNikke(response.data);
    } catch (error) {
      console.error('Error fetching the NIKKE data', error);
    } finally {
      setLoadingNikke(false);
    }
  };

  useEffect(() => {
    fetchRandomPokemon();
    fetchNikke('anis'); // Fetch a specific NIKKE character, e.g., 'anis'
  }, []);

  useEffect(() => {
    if (pokemon && chartRef.current) {
      const data = {
        labels: pokemon.stats.map(stat => stat.stat.name),
        datasets: [{
          label: pokemon.name,
          data: pokemon.stats.map(stat => stat.base_stat),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        }]
      };

      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      chartInstanceRef.current = new Chart(chartRef.current, {
        type: 'radar',
        data: data,
        options: {
          scales: {
            r: {
              beginAtZero: true,
              max: 150,
            }
          },
          responsive: true,
          maintainAspectRatio: false
        }
      });
    }
  }, [pokemon]);

  const japaneseName = pokemon?.names?.find(name => name.language.name === 'ja-Hrkt')?.name;

  return (
    <div className="app-container">
      <div className="pokemon-container">
        <div className="pokemon-content">
          {pokemon && (
            <>
              <h2>{pokemon.name}</h2>
              {japaneseName && <h3>{japaneseName}</h3>}
              <img className="pokemon-image" src={pokemon.sprites.front_default} alt={pokemon.name} />
              <p>Height: {pokemon.height}</p>
              <p>Weight: {pokemon.weight}</p>
              <p>Abilities:</p>
              <ul>
                {pokemon.abilities.map((ability, index) => (
                  <li key={index}>{ability.ability.name}</li>
                ))}
              </ul>
              <p>Types:</p>
              <ul>
                {pokemon.types.map((type, index) => (
                  <li key={index}>{type.type.name}</li>
                ))}
              </ul>
              <div style={{ position: 'relative', width: '100%', height: '400px' }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </>
          )}
        </div>
        <button onClick={fetchRandomPokemon} disabled={loadingPokemon}>Get Random Pokémon</button>
        {loadingPokemon && <p className="loading">Loading...</p>}
      </div>
      
      <div className="nikke-container">
        <div className="nikke-content">
          {nikke && (
            <>
              <h2>{nikke.name}</h2>
              <img className="nikke-image" src={nikke.images.full} alt={nikke.name} />
              <p>Rarity: {nikke.rarity}</p>
              <p>Element: {nikke.element}</p>
              <p>Weapon: {nikke.weapon}</p>
              <p>Class: {nikke.class}</p>
              <p>Skills:</p>
              <ul>
                {nikke.skills.map((skill, index) => (
                  <li key={index}>
                    <strong>{skill.name}:</strong> {skill.description}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <button onClick={() => fetchNikke('anis')} disabled={loadingNikke}>Get Anis Info</button>
        {loadingNikke && <p className="loading">Loading...</p>}
      </div>
    </div>
  );
};

export default App;
