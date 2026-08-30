'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PersonCard from '@/components/PersonCard';

const TIER_LABELS = {
  1: 'DIAMOND | 2016 and earlier',
  2: 'GOLD | 2017 to 2019',
  3: 'SILVER | 2020 to 2022',
  4: 'BRONZE | 2023 to 2025',
  5: 'RISING | 2026',
};

const TIER_STYLES = {
  1: { border: 'card-diamond', bg: '#EAF6FB', photoBorder: '#A0D8EF' },
  2: { border: 'card-gold', bg: '#e5d9b9', photoBorder: '#D4AF37' },
  3: { border: 'card-silver', bg: '#d9d9d9', photoBorder: '#8A8A8A' },
  4: { border: 'card-metallic', bg: '#b8a37a', photoBorder: '#6B4423' },
  5: { border: 'card-white', bg: '#FFFFFF', photoBorder: '#E5E5E5' },
};

export default function WallPage() {
  const [expandedPerson, setExpandedPerson] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState('tier');
  const router = useRouter();

  useEffect(() => {
    const visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      router.push('/');
      return;
    }

    async function loadWall() {
      const { data, error } = await supabase
        .from('people_with_tier')
        .select('*')
        .order('tier')
        .order('surname');

      if (error) {
        console.error('Failed to load wall:', error);
      } else {
        setPeople(data);
      }
      setLoading(false);
    }
    loadWall();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('visitor_id');
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading the wall...</p>
      </main>
    );
  }

  // Card renderer shared by both tier-mode and year-mode
  const renderCard = (p) => {
    const style = TIER_STYLES[p.tier];
    return (
      <div key={p.id} className="flex flex-col items-center flex-shrink-0 w-56 sm:w-60 lg:w-64">
        <div
          className={`${style.border} p-4 card-hover`}
          onClick={() => setExpandedPerson({ person: p, style })}
        >
          <div
            className="rounded-lg p-4 min-h-[280px] flex flex-col justify-between"
            style={{ backgroundColor: style.bg }}
          >
            <PersonCard person={p} borderColor={style.photoBorder} />
          </div>
        </div>
        <div className="text-xs mt-3 text-center max-w-[11rem]">
          {p.degree && <p className="text-white font-bold">{p.degree}</p>}
          {p.major && <p className="text-neutral-400 italic mt-1">{p.major}</p>}
        </div>
      </div>
    );
  };

  // --- TIER MODE grouping ---
  const groupedByTier = people.reduce((acc, p) => {
    (acc[p.tier] ??= []).push(p);
    return acc;
  }, {});

  // --- YEAR MODE grouping ---
  const groupedByYear = people.reduce((acc, p) => {
    (acc[p.year_met] ??= []).push(p);
    return acc;
  }, {});

  let sortedYears = Object.keys(groupedByYear).map(Number);
  if (sortMode === 'year-earliest') {
    sortedYears.sort((a, b) => a - b); // earliest year first (e.g. 2016 before 2026)
  } else if (sortMode === 'year-oldest') {
    sortedYears.sort((a, b) => b - a); // most recent year first (e.g. 2026 before 2016)
  }

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex justify-end items-center gap-4 mb-8">
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className="text-sm border rounded px-3 py-1.5 text-neutral-700"
        >
          <option value="tier">Sort by Tier</option>
          <option value="year-earliest">Oldest to Latest Year</option>
          <option value="year-oldest">Latest to Oldest Year</option>
        </select>
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-neutral-800 underline"
        >
          Logout
        </button>
      </div>

      {sortMode === 'tier'
        ? Object.entries(TIER_LABELS).map(([tier, label]) => (
            <section key={tier} className="mb-10 sm:mb-14">
              <h2 className="text-md font-regular mb-6 font-serif">{label}</h2>
              {groupedByTier[tier]?.length ? (
                <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto overflow-y-visible py-6">
                  {groupedByTier[tier].map((p) => renderCard(p))}
                </div>
              ) : (
                <p className="text-sm text-neutral-400 italic">
                  NO PERSONA ACHIEVED THIS TIER
                </p>
              )}
            </section>
          ))
        : sortedYears.map((year) => (
            <section key={year} className="mb-10 sm:mb-14">
              <h2 className="text-md font-regular mb-6 font-serif">{year}</h2>
              <div className="flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto overflow-y-visible py-6">
                {groupedByYear[year].map((p) => renderCard(p))}
              </div>
            </section>
          ))}

      {expandedPerson && (
        <div className="modal-overlay" onClick={() => setExpandedPerson(null)}>
          <div className="flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className={`modal-card ${expandedPerson.style.border} p-6`}>
              <div
                className="rounded-lg p-6 flex flex-col justify-between"
                style={{ backgroundColor: expandedPerson.style.bg }}
              >
                <PersonCard
                  person={expandedPerson.person}
                  borderColor={expandedPerson.style.photoBorder}
                />
              </div>
            </div>
            <div className="text-sm mt-4 text-center max-w-lg">
              {expandedPerson.person.degree && (
                <p className="text-white font-bold">{expandedPerson.person.degree}</p>
              )}
              {expandedPerson.person.major && (
                <p className="text-white italic mt-1">{expandedPerson.person.major}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}