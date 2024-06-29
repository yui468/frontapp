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
  japaneseName?: string;
}

const Pokemon: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchRandomPokemon = async () => {
    setLoadingPokemon(true);
    try {
      const randomId = Math.floor(Math.random() * 898) + 1; // Pokémon ID ranges from 1 to 898
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const speciesResponse = await axios.get(response.data.species.url);
      const japaneseName = speciesResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'ja-Hrkt')?.name;
      setPokemon({ ...response.data, japaneseName });
    } catch (error) {
      console.error('Error fetching the Pokémon data', error);
    } finally {
      setLoadingPokemon(false);
    }
  };

  useEffect(() => {
    fetchRandomPokemon();
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

  return (
    <div className="pokemon-container">
      <div className="pokemon-content">
        {pokemon && (
          <>
            <h2>{pokemon.japaneseName || pokemon.name}</h2>
            <img className="pokemon-image" src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p>高さ: {pokemon.height} dm</p>
            <p>重さ: {pokemon.weight} hg</p>
            <p>特性:</p>
            <ul>
              {pokemon.abilities.map((ability, index) => (
                <li key={index}>{ability.ability.name}</li>
              ))}
            </ul>
            <p>タイプ:</p>
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
      <button onClick={fetchRandomPokemon} disabled={loadingPokemon}>
        {loadingPokemon ? '読込中...' : 'ランダムなポケモンを取得'}
      </button>
    </div>
  );
};

export default Pokemon;
