import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';

export default function PersonCard({ person }) {
  const { data } = supabase.storage
    .from('portraits')
    .getPublicUrl(person.photo_path);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-32 h-40 relative rounded overflow-hidden bg-neutral-200">
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
      <p className="mt-2 font-semibold uppercase text-sm">
        {person.honorific ? `${person.honorific} ` : ''}
        {person.surname}
      </p>
      <p className="text-sm">
        {person.first_name} {person.middle_initial || ''}
      </p>
      <p className="text-xs text-neutral-500 mt-1 max-w-[9rem]">{person.degree}</p>
    </div>
  );
}