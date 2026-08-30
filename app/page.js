'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const CODE_LENGTH = 6;

export default function SelectorPage() {
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(''));
  const [entering, setEntering] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [matchedPerson, setMatchedPerson] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const inputRefs = useRef([]);

  const code = digits.join('');

  const handleChange = (index, value) => {
    if (!/^[a-zA-Z0-9]?$/.test(value)) return; // only allow single alphanumeric char

    const newDigits = [...digits];
    newDigits[index] = value.toUpperCase();
    setDigits(newDigits);
    setError('');

    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleEnter();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().toUpperCase().slice(0, CODE_LENGTH);
    const newDigits = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    const lastFilled = Math.min(pasted.length, CODE_LENGTH) - 1;
    if (lastFilled >= 0) inputRefs.current[lastFilled]?.focus();
  };

  const handleEnter = async () => {
    if (code.length < CODE_LENGTH || entering || showWelcome) return;
    setError('');
    setEntering(true);

    const { data, error: fetchError } = await supabase
      .from('people_with_tier')
      .select('id, honorific, first_name, middle_initial, surname, access_code')
      .eq('access_code', code)
      .maybeSingle();

    if (fetchError || !data) {
      setEntering(false);
      setError('Invalid code. Please try again.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      return;
    }

    localStorage.setItem('visitor_id', data.id);
    await supabase.from('visits').insert({ person_id: data.id });

    setTimeout(() => {
      setEntering(false);
      setMatchedPerson(data);
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
          <p className="text-white text-sm tracking-widest">ENTERING...</p>
        </div>
      ) : showWelcome ? (
        <div className="flex flex-col items-center justify-center text-center">
          <p className="text-[#D4AF37] text-sm tracking-[0.3em] mb-3">WELCOME</p>
          <h1 className="text-2xl font-medium text-white">
            {matchedPerson?.honorific} {matchedPerson?.first_name}{' '}
            {matchedPerson?.middle_initial} {matchedPerson?.surname}
          </h1>
        </div>
      ) : (
        <>
          <h1 className="text-xl font-medium text-center text-white">
            Enter your code
          </h1>
          <div className="flex gap-2" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg
                           border-[#D4AF37]/40 bg-black/30 text-white
                           focus:outline-none focus:border-[#D4AF37]"
              />
            ))}
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            onClick={handleEnter}
            disabled={code.length < CODE_LENGTH}
            className="bg-black text-white px-6 py-2 rounded disabled:opacity-40"
          >
            Enter
          </button>
        </>
      )}
    </main>
  );
}