
import React from 'react';
import { Muster, Emotionalitaet, Kontext } from '../types';

interface CheckboxFilterProps<T> {
  title: string;
  options: T[];
  selected: T[];
  onChange: (value: T) => void;
}

const CheckboxFilter = <T extends string,>({ title, options, selected, onChange }: CheckboxFilterProps<T>) => (
  <div className="mb-6">
    <h3 className="font-semibold text-gray-400 mb-2 text-sm">{title}</h3>
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option} className="flex items-center space-x-2 cursor-pointer text-gray-300 hover:text-white">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 rounded bg-gray-700 border-gray-600 text-sky-600 focus:ring-sky-500"
            checked={selected.includes(option)}
            onChange={() => onChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  </div>
);


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  allSprecher: string[];
  selectedKontext: Kontext[];
  setSelectedKontext: React.Dispatch<React.SetStateAction<Kontext[]>>;
  selectedMuster: Muster[];
  setSelectedMuster: React.Dispatch<React.SetStateAction<Muster[]>>;
  selectedEmotionalitaet: Emotionalitaet[];
  setSelectedEmotionalitaet: React.Dispatch<React.SetStateAction<Emotionalitaet[]>>;
  selectedSprecher: string[];
  setSelectedSprecher: React.Dispatch<React.SetStateAction<string[]>>;
  resetFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen, setIsOpen, allSprecher,
  selectedKontext, setSelectedKontext,
  selectedMuster, setSelectedMuster,
  selectedEmotionalitaet, setSelectedEmotionalitaet,
  selectedSprecher, setSelectedSprecher,
  resetFilters
}) => {
  const toggleSelection = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, selected: T[], value: T) => {
    setter(selected.includes(value) ? selected.filter(item => item !== value) : [...selected, value]);
  };

  return (
    <div className={`flex-shrink-0 bg-gray-850 border-r border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'} overflow-hidden`}>
      <div className="p-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Filter</h2>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2">
          <CheckboxFilter
            title="Kontext / Thema"
            options={Object.values(Kontext)}
            selected={selectedKontext}
            onChange={(val) => toggleSelection(setSelectedKontext, selectedKontext, val)}
          />

          <CheckboxFilter
            title="Muster"
            options={Object.values(Muster)}
            selected={selectedMuster}
            onChange={(val) => toggleSelection(setSelectedMuster, selectedMuster, val)}
          />

          <CheckboxFilter
            title="Emotionalität"
            options={Object.values(Emotionalitaet)}
            selected={selectedEmotionalitaet}
            onChange={(val) => toggleSelection(setSelectedEmotionalitaet, selectedEmotionalitaet, val)}
          />

          <CheckboxFilter
            title="Sprecher / Gruppe"
            options={allSprecher}
            selected={selectedSprecher}
            onChange={(val) => toggleSelection(setSelectedSprecher, selectedSprecher, val)}
          />
        </div>
        
        <button
          onClick={resetFilters}
          className="w-full mt-4 px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-850 focus:ring-sky-500"
        >
          Filter zurücksetzen
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
