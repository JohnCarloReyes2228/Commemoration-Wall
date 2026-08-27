import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function PersonCard({ person }) {
  const { data } = supabase.storage
    .from('portraits')
    .getPublicUrl(person.photo_path);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-36 h-48 relative rounded overflow-hidden bg-neutral-200">
        {person.photo_path ? (
          <Image
            src={data.publicUrl}
            alt={`${person.first_name} ${person.surname}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">
            No photo
          </div>
        )}
      </div>
      <p className="mt-2 font-semibold text-md text-neutral-950 font-serif">
        {person.honorific ? `${person.honorific} ` : ''}
        <span className="uppercase">{person.surname}</span>
      </p>
      <p className=" text-sm text-neutral-950 font-serif">
        {person.first_name} {person.middle_initial || ''}
      </p>
      <p className="italic text-[9px] text-neutral-700 mt-2 max-w-[9rem] font-mono">{person.degree}</p>
    </div>
  );
}