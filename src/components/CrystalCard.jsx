import Image from 'next/image';
import { getCrystalImage } from '@/lib/crystalImages';

export default function CrystalCard({ name, benefit }) {
  const crystalImage = getCrystalImage(name);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center h-full flex flex-col overflow-hidden">
      {/* Crystal Image */}
      <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={crystalImage.url}
          alt={crystalImage.alt}
          fill
          className="object-cover"
          sizes="128px"
          priority={false}
        />
      </div>

      {/* Crystal Name */}
      <h3 className="font-bold text-gray-900 mb-2 text-lg flex-grow">
        {name}
      </h3>

      {/* Benefit/Property */}
      <p className="text-sm text-gray-600">
        {benefit}
      </p>
    </div>
  );
}
