import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

const Nikke: React.FC = () => {
  const [nikke, setNikke] = useState<NikkeData | null>(null);
  const [loadingNikke, setLoadingNikke] = useState(false);
  const [allNikkeNames, setAllNikkeNames] = useState<string[]>([]);

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

  const fetchAllNikkeNames = async () => {
    try {
      const response = await axios.get('https://nikke-api.vercel.app/characters');
      setAllNikkeNames(response.data.map((nikke: NikkeData) => nikke.name));
    } catch (error) {
      console.error('Error fetching the NIKKE names', error);
    }
  };

  const fetchRandomNikke = () => {
    if (allNikkeNames.length > 0) {
      const randomIndex = Math.floor(Math.random() * allNikkeNames.length);
      const randomNikkeName = allNikkeNames[randomIndex];
      fetchNikke(randomNikkeName);
    }
  };

  useEffect(() => {
    fetchAllNikkeNames();
    fetchNikke('anis'); // 初回に特定のNIKKEキャラクターを取得
  }, []);

  return (
    <div className="nikke-container">
      <div className="nikke-content">
        {nikke && (
          <>
            <h2>{nikke.name}</h2>
            <img className="nikke-image" src={nikke.images.full} alt={nikke.name} />
            <p>レアリティ: {nikke.rarity}</p>
            <p>エレメント: {nikke.element}</p>
            <p>武器: {nikke.weapon}</p>
            <p>クラス: {nikke.class}</p>
            <p>スキル:</p>
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
      <button onClick={fetchRandomNikke} disabled={loadingNikke}>
        {loadingNikke ? '読込中...' : 'ランダムなNIKKEを取得'}
      </button>
    </div>
  );
};

export default Nikke;
