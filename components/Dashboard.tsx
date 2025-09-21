
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, LineChart, Line, Sankey, LabelList } from 'recharts';
import { BerechneterGespraechsEintrag, Muster, Emotionalitaet, Kontext } from '../types';
import ChartContainer from './ChartContainer';
import KpiCard from './KpiCard';
import { KpiIcon1, KpiIcon2, KpiIcon3 } from './icons';
import { SankeyNode, SankeyLink } from 'recharts/types/util/types';

interface DashboardProps {
  data: BerechneterGespraechsEintrag[];
  allData: BerechneterGespraechsEintrag[];
}

const TABS = ['Übersicht', 'Kontext-Analyse', 'Rollen-Analyse', 'Timeline / Verlauf'];
const COLORS = ['#0ea5e9', '#6366f1', '#ec4899', '#f97316', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 p-2 border border-gray-700 rounded-md shadow-lg text-sm">
        <p className="label font-bold text-white">{`${label}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color }}>{`${pld.name}: ${pld.value}`}</p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  const stats = useMemo(() => {
    if (data.length === 0) {
      return { avgChance: 0, reversalCount: 0, avgEmotionality: 'N/A' };
    }
    const avgChance = data.reduce((acc, curr) => acc + curr.veraenderungsChance, 0) / data.length;
    const reversalCount = data.filter(d => d.muster !== Muster.Keins).length;
    const emotionalityMap: { [key in Emotionalitaet]: number } = { [Emotionalitaet.Hoch]: 1, [Emotionalitaet.Mittel]: 0.5, [Emotionalitaet.Niedrig]: 0 };
    const totalEmotionality = data.reduce((acc, curr) => acc + emotionalityMap[curr.emotionalitaet], 0);
    const avgEmotionalityValue = totalEmotionality / data.length;
    let avgEmotionality: string;
    if (avgEmotionalityValue > 0.75) avgEmotionality = 'Hoch';
    else if (avgEmotionalityValue > 0.25) avgEmotionality = 'Mittel';
    else avgEmotionality = 'Niedrig';
    
    return { avgChance, reversalCount, avgEmotionality };
  }, [data]);

  const musterHaeufigkeit = useMemo(() => {
    // FIX: Add explicit type to the accumulator in reduce to prevent type errors.
    const counts = data.reduce((acc: Record<Muster, number>, curr) => {
      if (curr.muster !== Muster.Keins) {
        acc[curr.muster] = (acc[curr.muster] || 0) + 1;
      }
      return acc;
    }, {} as Record<Muster, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, Häufigkeit: value })).sort((a, b) => b.Häufigkeit - a.Häufigkeit);
  }, [data]);

  const verantwortungData = useMemo(() => {
    const counts = data.reduce((acc: Record<string, number>, curr) => {
      acc[curr.verantwortungUebernommen] = (acc[curr.verantwortungUebernommen] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);
  
  const heatmapData = useMemo(() => {
      const matrix: { [key in Kontext]?: { [key in Muster]?: number } } = {};
      for (const item of data) {
          if (item.muster !== Muster.Keins) {
              if (!matrix[item.kontext]) {
                  matrix[item.kontext] = {};
              }
              matrix[item.kontext]![item.muster] = (matrix[item.kontext]![item.muster] || 0) + 1;
          }
      }
      return matrix;
  }, [data]);
  
  const scatterData = useMemo(() => {
    const emotionalityMap = { [Emotionalitaet.Hoch]: 3, [Emotionalitaet.Mittel]: 2, [Emotionalitaet.Niedrig]: 1 };
    return data.map(d => ({
        x: d.veraenderungsChance,
        y: emotionalityMap[d.emotionalitaet] + (Math.random() - 0.5) * 0.5, // Jitter
        z: 1, // Size of dot
        sprecher: d.sprecher
    }));
  }, [data]);
  
  const sankeyData = useMemo(() => {
    if (data.length < 2) return { nodes: [], links: [] };

    const nodes: SankeyNode[] = Array.from(new Set(data.map(d => d.sprecher))).map(name => ({ name }));
    const links: SankeyLink[] = [];
    // FIX: Add explicit type to the accumulator in reduce to fix errors on `gespraech.sort` and `gespraech.length`.
    const groupedByGespraech = data.reduce((acc: Record<string, BerechneterGespraechsEintrag[]>, curr) => {
      acc[curr.gespraechsId] = acc[curr.gespraechsId] || [];
      acc[curr.gespraechsId].push(curr);
      return acc;
    }, {} as Record<string, BerechneterGespraechsEintrag[]>);

    Object.values(groupedByGespraech).forEach(gespraech => {
      gespraech.sort((a,b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
      for (let i = 0; i < gespraech.length - 1; i++) {
        const sourceSprecher = gespraech[i].sprecher;
        const targetSprecher = gespraech[i+1].sprecher;
        if(gespraech[i+1].muster !== Muster.Keins && sourceSprecher !== targetSprecher) {
            const sourceIndex = nodes.findIndex(n => n.name === sourceSprecher);
            const targetIndex = nodes.findIndex(n => n.name === targetSprecher);
            if(sourceIndex > -1 && targetIndex > -1) {
                const existingLink = links.find(l => l.source === sourceIndex && l.target === targetIndex);
                if(existingLink) {
                    (existingLink.value as number) += 1;
                } else {
                    links.push({ source: sourceIndex, target: targetIndex, value: 1 });
                }
            }
        }
      }
    });

    return { nodes, links };
  }, [data]);
  
  const timelineData = useMemo(() => {
      // FIX: Add explicit type to the accumulator in reduce to fix errors when accessing `values.chances` and `values.musterCount`.
      const groupedByDay = data.reduce((acc: Record<string, { chances: number[], musterCount: number }>, curr) => {
          const day = new Date(curr.datum).toISOString().split('T')[0];
          if (!acc[day]) {
              acc[day] = {
                  chances: [],
                  musterCount: 0
              };
          }
          acc[day].chances.push(curr.veraenderungsChance);
          if (curr.muster !== Muster.Keins) {
              acc[day].musterCount += 1;
          }
          return acc;
      }, {} as Record<string, { chances: number[], musterCount: number }>);

      return Object.entries(groupedByDay)
          .map(([day, values]) => ({
              datum: day,
              'Durchschn. Veränderungs-Chance': values.chances.reduce((a, b) => a + b, 0) / values.chances.length,
              'Anzahl Umkehr-Muster': values.musterCount
          }))
          .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
  }, [data]);
  

  const renderContent = () => {
    if (data.length === 0) {
        return <div className="text-center text-gray-400 p-8">Keine Daten für die aktuelle Filterauswahl vorhanden.</div>;
    }
      
    switch (activeTab) {
      case 'Übersicht':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <KpiCard title="Durchschn. Veränderungs-Chance" value={`${stats.avgChance.toFixed(1)}%`} icon={<KpiIcon1 />} />
            <KpiCard title="Anzahl der Umkehr-Versuche" value={stats.reversalCount.toString()} icon={<KpiIcon2 />} />
            <KpiCard title="Durchschn. emotionale Intensität" value={stats.avgEmotionality} icon={<KpiIcon3 />} />
            <div className="md:col-span-2">
            <ChartContainer title="Häufigkeit der Muster">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={musterHaeufigkeit} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2}/>
                  <XAxis dataKey="name" stroke="#9ca3af"/>
                  <YAxis stroke="#9ca3af"/>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="Häufigkeit" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            </div>
            <ChartContainer title="Verantwortung übernommen">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={verantwortungData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {verantwortungData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        );
      case 'Kontext-Analyse':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Heatmap: Muster vs. Kontext">
                    <div className="flex flex-col h-full">
                        <div className="grid grid-cols-5 gap-1 text-xs font-bold text-center mb-1">
                            <div></div>
                            {Object.values(Muster).filter(m => m !== Muster.Keins).map(m => <div key={m}>{m}</div>)}
                        </div>
                        {Object.values(Kontext).map(k => (
                            <div key={k} className="grid grid-cols-5 gap-1 items-center flex-grow">
                                <div className="font-bold text-xs text-right pr-2">{k}</div>
                                {Object.values(Muster).filter(m => m !== Muster.Keins).map(m => {
                                    const count = heatmapData[k]?.[m] || 0;
                                    const opacity = count > 0 ? Math.min(0.2 + (count / 5) * 0.8, 1) : 0;
                                    return (
                                        <div key={m} className="bg-sky-500 rounded flex items-center justify-center text-white font-bold h-full" style={{ opacity }}>
                                            {count > 0 && count}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </ChartContainer>
                <ChartContainer title="Emotionalität vs. Veränderungs-Chance">
                    <ResponsiveContainer width="100%" height={400}>
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis type="number" dataKey="x" name="Veränderungs-Chance" unit="%" stroke="#9ca3af" />
                            <YAxis type="number" dataKey="y" name="Emotionalität" stroke="#9ca3af" domain={[0, 4]} ticks={[1, 2, 3]} tickFormatter={(val) => ['Niedrig', 'Mittel', 'Hoch'][val-1]}/>
                            <ZAxis type="number" dataKey="z" range={[50, 100]} name="size"/>
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter name="Gesprächsbeitrag" data={scatterData} fill="#0ea5e9" />
                        </ScatterChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
      case 'Rollen-Analyse':
        return (
            <div className="grid grid-cols-1 gap-6">
                <ChartContainer title="Sankey-Diagramm: Schuldabwehr-Muster" className="h-[500px]">
                  {sankeyData.links.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <Sankey
                            data={sankeyData}
                            nodePadding={50}
                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            link={{ stroke: '#60a5fa', strokeOpacity: 0.5 }}
                        >
                          <Tooltip content={<CustomTooltip />} />
                        </Sankey>
                    </ResponsiveContainer>
                  ) : <div className="flex items-center justify-center h-full text-gray-500">Nicht genügend Interaktionsdaten für dieses Diagramm.</div>}
                </ChartContainer>
            </div>
        );
      case 'Timeline / Verlauf':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Veränderungs-Chance über Zeit">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="datum" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%"/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Line type="monotone" dataKey="Durchschn. Veränderungs-Chance" stroke="#0ea5e9" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <ChartContainer title="Anzahl von Umkehr-Mustern pro Zeitraum">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                            <XAxis dataKey="datum" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Anzahl Umkehr-Muster" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>
      {renderContent()}
    </div>
  );
};

export default Dashboard;