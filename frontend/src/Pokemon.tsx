import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import './Pokemon.css';

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
      url: string;
    };
    is_hidden: boolean;
  }>;
  types: Array<{
    type: {
      name: string;
      url: string;
    };
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  japaneseName?: string;
  japaneseAbilities?: string[];
  japaneseTypes?: string[];
}

const statLabels: { [key: string]: string } = {
  hp: 'HP',
  attack: '攻撃',
  defense: '防御',
  'special-attack': '特攻',
  'special-defense': '特防',
  speed: '速度'
};

const Pokemon: React.FC = () => {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchAbilityOrTypeInJapanese = useCallback(async (url: string): Promise<string> => {
    const response = await axios.get(url);
    const japaneseName = response.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'ja-Hrkt')?.name;
    return japaneseName || 'N/A';
  }, []);

  const fetchPokemonDetails = useCallback(async (randomId: number) => {
    setLoadingPokemon(true);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
      const speciesResponse = await axios.get(response.data.species.url);
      const japaneseName = speciesResponse.data.names.find((name: { language: { name: string; }; }) => name.language.name === 'ja-Hrkt')?.name;

      const abilities = await Promise.all(response.data.abilities.map(async (ability: { ability: { url: string; }; }) => {
        const japaneseAbilityName = await fetchAbilityOrTypeInJapanese(ability.ability.url);
        return japaneseAbilityName;
      }));

      const types = await Promise.all(response.data.types.map(async (type: { type: { url: string; }; }) => {
        const japaneseTypeName = await fetchAbilityOrTypeInJapanese(type.type.url);
        return japaneseTypeName;
      }));

      setPokemon({
        ...response.data,
        japaneseName,
        japaneseAbilities: abilities,
        japaneseTypes: types,
      });
    } catch (error) {
      console.error('Error fetching the Pokémon data', error);
    } finally {
      setLoadingPokemon(false);
    }
  }, [fetchAbilityOrTypeInJapanese]);

  const fetchRandomPokemon = useCallback(async () => {
    const randomId = Math.floor(Math.random() * 898) + 1; // Pokémon ID ranges from 1 to 898
    await fetchPokemonDetails(randomId);
  }, [fetchPokemonDetails]);

  useEffect(() => {
    fetchRandomPokemon();
  }, [fetchRandomPokemon]);

  useEffect(() => {
    if (pokemon && chartRef.current) {
      const data = {
        labels: pokemon.stats.map(stat => statLabels[stat.stat.name]),
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

  useEffect(() => {
    if (pokemon && canvasRef.current) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = pokemon.sprites.front_default;

      img.onload = () => {
        const ctx = canvasRef.current!.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          ctx.drawImage(img, 0, 0, canvasRef.current!.width, canvasRef.current!.height);

          const imageData = ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
          const data = imageData.data;

          // シャープネスフィルターを適用
          const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
          ];
          const weight = kernel.reduce((a, b) => a + b);

          for (let i = 0; i < data.length; i += 4) {
            let sumR = 0, sumG = 0, sumB = 0;

            for (let j = 0; j < kernel.length; j++) {
              const k = kernel[j];
              sumR += data[i + 0] * k;
              sumG += data[i + 1] * k;
              sumB += data[i + 2] * k;
            }

            data[i + 0] = Math.min(255, Math.max(0, sumR / weight));
            data[i + 1] = Math.min(255, Math.max(0, sumG / weight));
            data[i + 2] = Math.min(255, Math.max(0, sumB / weight));
          }

          ctx.putImageData(imageData, 0, 0);
        }
      };
    }
  }, [pokemon]);

  return (
    <div className="pokedex-container">
      <div className="pokedex-screen">
        {pokemon && (
          <>
            <div className="pokedex-header">
              <h2>{pokemon.japaneseName || pokemon.name}</h2>
            </div>
            <div className="pokedex-content">
              <div className="pokedex-image-container">
                <canvas ref={canvasRef} width="300" height="300" className="pokemon-image"></canvas>
              </div>
              <div className="pokedex-info">
                <p>高さ: {pokemon.height} dm</p>
                <p>重さ: {pokemon.weight} hg</p>
                <div className="horizontal-list">
                  <p>特性:</p>
                  <ul>
                    {pokemon.japaneseAbilities?.map((ability, index) => (
                      <li key={index}>{ability}</li>
                    ))}
                  </ul>
                </div>
                <div className="horizontal-list">
                  <p>タイプ:</p>
                  <ul>
                    {pokemon.japaneseTypes?.map((type, index) => (
                      <li key={index}>{type}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="pokedex-chart">
              <canvas ref={chartRef}></canvas>
            </div>
          </>
        )}
      </div>
      <button className="pokedex-button" onClick={fetchRandomPokemon} disabled={loadingPokemon}>
        {loadingPokemon ? '読込中...' : 'ランダムなポケモンを取得'}
      </button>
    </div>
  );
};

export default Pokemon;
