import React from 'react';
import Image from 'next/image';

interface DoctorProfileImageProps {
  profileImage?: string;
}

const DoctorProfileImage: React.FC<DoctorProfileImageProps> = React.memo(({ profileImage }) => {
  return (
    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0">
      <Image
        src={profileImage || "/profpic.png"}
        alt={profileImage ? "Profile" : "Profile placeholder"}
        fill
        sizes="(max-width: 640px) 80px, 96px"
        className="object-cover"
      />
    </div>
  );
});

DoctorProfileImage.displayName = 'DoctorProfileImage';

export default DoctorProfileImage;