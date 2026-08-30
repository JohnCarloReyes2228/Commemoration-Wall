import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function PersonCard({ person, borderColor }) {
  const { data } = supabase.storage
    .from('portraits')
    .getPublicUrl(person.photo_path);

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className="w-32 h-44 sm:w-36 sm:h-48 relative rounded overflow-hidden bg-neutral-200 border-2"
        style={{ borderColor: borderColor || '#E5E5E5' }}
      >
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
      <p className="mt-4 font-semibold text-md text-neutral-950 font-serif">
        {person.honorific ? `${person.honorific} ` : ''}
        <span className="uppercase">{person.surname}</span>
      </p>
      <p className=" text-sm text-neutral-950 font-serif">
        {person.first_name} {person.middle_initial || ''}
      </p>
      {person.year_grad && (
        <p className=" italic graduation-year text-[10px] text-neutral-900 font-serif mt-3">
          Class of {person.year_grad}
        </p>
      )}
    </div>
  );
}