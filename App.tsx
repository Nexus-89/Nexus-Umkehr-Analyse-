
import React, { useState, useMemo } from 'react';
import { MOCK_DATA } from './constants';
import { calculateVeraenderungsChance } from './services/calculationService';
import { BerechneterGespraechsEintrag, GespraechsEintrag, Muster, Emotionalitaet, Kontext } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [selectedKontext, setSelectedKontext] = useState<Kontext[]>([]);
  const [selectedMuster, setSelectedMuster] = useState<Muster[]>([]);
  const [selectedEmotionalitaet, setSelectedEmotionalitaet] = useState<Emotionalitaet[]>([]);
  const [selectedSprecher, setSelectedSprecher] = useState<string[]>([]);
  
  const processedData: BerechneterGespraechsEintrag[] = useMemo(() => {
    return MOCK_DATA.map((eintrag: GespraechsEintrag) => ({
      ...eintrag,
      veraenderungsChance: calculateVeraenderungsChance(eintrag),
    }));
  }, []);
  
  const filteredData = useMemo(() => {
    return processedData.filter(d => {
      const kontextMatch = selectedKontext.length === 0 || selectedKontext.includes(d.kontext);
      const musterMatch = selectedMuster.length === 0 || selectedMuster.includes(d.muster);
      const emotionalitaetMatch = selectedEmotionalitaet.length === 0 || selectedEmotionalitaet.includes(d.emotionalitaet);
      const sprecherMatch = selectedSprecher.length === 0 || selectedSprecher.includes(d.sprecher);
      return kontextMatch && musterMatch && emotionalitaetMatch && sprecherMatch;
    });
  }, [processedData, selectedKontext, selectedMuster, selectedEmotionalitaet, selectedSprecher]);

  const allSprecher = useMemo(() => [...new Set(MOCK_DATA.map(d => d.sprecher))], []);
  
  const resetFilters = () => {
    setSelectedKontext([]);
    setSelectedMuster([]);
    setSelectedEmotionalitaet([]);
    setSelectedSprecher([]);
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        allSprecher={allSprecher}
        selectedKontext={selectedKontext}
        setSelectedKontext={setSelectedKontext}
        selectedMuster={selectedMuster}
        setSelectedMuster={setSelectedMuster}
        selectedEmotionalitaet={selectedEmotionalitaet}
        setSelectedEmotionalitaet={setSelectedEmotionalitaet}
        selectedSprecher={selectedSprecher}
        setSelectedSprecher={setSelectedSprecher}
        resetFilters={resetFilters}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-between items-center p-4 border-b border-gray-800">
           <div className="flex items-center space-x-3">
             <LogoIcon />
             <h1 className="text-xl font-bold text-white">Umkehr-Muster Analyse Dashboard</h1>
           </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-950 p-4 sm:p-6">
           <Dashboard data={filteredData} allData={processedData} />
        </main>
      </div>
    </div>
  );
};

export default App;
