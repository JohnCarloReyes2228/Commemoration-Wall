'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SelectorPage() {
  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadPeople() {
      const { data, error } = await supabase
        .from('people_with_tier')
        .select('id, honorific, first_name, middle_initial, surname')
        .order('surname');

      if (error) {
        console.error('Failed to load people:', error);
      } else {
        setPeople(data);
      }
      setLoading(false);
    }
    loadPeople();
  }, []);

  const handleEnter = async () => {
    if (!selectedId || entering || showWelcome) return;
    setEntering(true)
    localStorage.setItem('visitor_id', selectedId);
    await supabase.from('visits').insert({ person_id: selectedId });
    setTimeout(() => {
      setEntering(false);
      setShowWelcome(true);
      setTimeout(() => {
        router.push('/wall');
      }, 1000);
    }, 3000);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-black via-neutral-950 to-[#7A5C00] px-4">
      {entering ? (
        <div className="flex flex-col items-center justify-center gap-5">
          <div className="w-12 h-12 border-4 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin"></div>
          <p className="text-white text-sm tracking-widest">
            ENTERING...
          </p>
        </div>
      ) : showWelcome ? (
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[#D4AF37] text-sm tracking-[0.3em] mb-3">
            WELCOME
          </p>
          <h1 className="text-2xl font-medium text-white">
            {people.find((p) => p.id === selectedId)?.honorific}{' '}
            {people.find((p) => p.id === selectedId)?.first_name}{' '}
            {people.find((p) => p.id === selectedId)?.middle_initial}{' '}
            {people.find((p) => p.id === selectedId)?.surname}
          </h1>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-medium text-center text-white">
            Welcome
          </h1>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border rounded px-4 py-2 min-w-[240px]"
          >
            <option value="">Select your name</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.surname}, {p.first_name}
              </option>
            ))}
          </select>
          <button
            onClick={handleEnter}
            disabled={!selectedId}
            className="bg-black text-white px-6 py-2 rounded disabled:opacity-40"
          >
            Enter
          </button>
        </>
      )}
    </main>
  );
}