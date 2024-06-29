import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

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

const Pokemon: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loading, setLoading] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchRandomPokemon = async () => {
    setLoading(true);
    try {
      const randomId = Math.floor(Math.random() * 898) + 1; // ポケモンのIDは1から898まで
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      setPokemon(response.data);
    } catch (error) {
      console.error('Error fetching the Pokemon data', error);
    } finally {
      setLoading(false);
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
          }
        }
      });
    }
  }, [pokemon]);

  const japaneseName = pokemon?.names.find(name => name.language.name === 'ja-Hrkt')?.name;

  return (
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
            <canvas ref={chartRef} width="400" height="400"></canvas>
          </>
        )}
      </div>
      <button onClick={fetchRandomPokemon} disabled={loading}>Get Random Pokemon</button>
      {loading && <p className="loading">Loading...</p>}
    </div>
  );
};

export default Pokemon;
