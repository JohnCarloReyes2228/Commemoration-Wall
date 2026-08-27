'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PersonCard from '@/components/PersonCard';

const TIER_LABELS = {
  1: 'TIER 1: 10 years and above',
  2: 'TIER 2: 6 to 9 years',
  3: 'TIER 3: 3 to 5 years',
  4: '2 years and below',
};
1 
export default function WallPage() {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
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
        .order('sort_order');

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
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-neutral-500 text-sm">Loading the wall...</p>
      </main>
    );
  }
  
  const grouped = people.reduce((acc, p) => {
    (acc[p.tier] ??= []).push(p);
    return acc;
  }, {});

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-end mb-8">
        <button
          onClick={handleLogout}
          className="text-sm text-neutral-500 hover:text-neutral-800 underline"
        >
          Logout
        </button>
      </div>

      {Object.entries(TIER_LABELS).map(([tier, label]) => (
        <section key={tier} className="mb-14">
          <h2 className="italic text-md font-bold mb-6 font-sans">{label}</h2>
          {grouped[tier]?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {grouped[tier].map((p) => {
                const tierStyles = {
                  '1': { border: 'card-diamond', bg: '#EAF6FB' },
                  '2': { border: 'card-gold', bg: '#e5d9b9' },
                  '3': { border: 'card-silver', bg: '#d9d9d9' },
                  '4': { border: 'card-metallic', bg: '#b8a37a' },
                };
                const style = tierStyles[tier];

                return (
                  <div key={p.id} className={`${style.border} p-4`}>
                    <div
                      className="rounded-lg p-4 min-h-[340px] flex flex-col justify-between"
                      style={{ backgroundColor: style.bg }}
                    >
                      <PersonCard person={p} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-neutral-400 italic">
              NO PERSONA ACHIEVED THIS TIER
            </p>
          )}
        </section>
      ))}
    </main>
  );
}