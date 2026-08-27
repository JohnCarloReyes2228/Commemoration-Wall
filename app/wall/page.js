'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import PersonCard from '@/components/PersonCard';

const TIER_LABELS = {
  1: '10 years and above',
  2: '6–9 years',
  3: '3–5 years',
  4: '2 years and below',
};

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
        .from('people')
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

      {Object.entries(TIER_LABELS).map(([tier, label]) =>
        grouped[tier]?.length ? (
          <section key={tier} className="mb-14">
            <h2 className="text-lg font-medium mb-6">{label}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
              {grouped[tier].map((p) => (
                <PersonCard key={p.id} person={p} />
              ))}
            </div>
          </section>
        ) : null
      )}
    </main>
  );
}