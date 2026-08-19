'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function SelectorPage() {
  const [people, setPeople] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPeople() {
      const { data, error } = await supabase
        .from('people')
        .select('id, surname, first_name')
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
    if (!selectedId) return;
    localStorage.setItem('visitor_id', selectedId);
    await supabase.from('visits').insert({ person_id: selectedId });
    router.push('/wall');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-neutral-50 px-4">
      <h1 className="text-xl font-medium text-center">Who are you?</h1>

      {loading ? (
        <p className="text-neutral-500 text-sm">Loading names...</p>
      ) : (
        <>
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