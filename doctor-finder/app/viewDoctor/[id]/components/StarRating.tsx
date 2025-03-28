import { Star, StarHalf } from "lucide-react";
import React from "react";


const StarRating = ({ rating}: { rating: number}) => {
  return (
    <div className="flex mt-0 sm:mt-2">
      {[...Array(5)].map((_, index) => {
        if (index + 1 <= rating) {
          // full star
          return <Star key={index} className="w-6 h-6 sm:w-5 sm:h-5 text-yellow-400 fill-current" />;
        } else if (index < rating && rating % 1 !== 0) {
          // half star
          return (
            <div key={index} className="relative w-6 h-6 sm:w-5 sm:h-5">
              <Star
                className="absolute inset-0 text-gray-300 dark:text-gray-600 fill-current w-full h-full"
              />
              <StarHalf
                className="absolute inset-0 text-yellow-400 fill-current w-full h-full"
              />
            </div>
          );
        } else {
          // empty star
          return <Star key={index} className="w-6 h-6 sm:w-5 sm:h-5 text-gray-300 dark:text-gray-600 fill-current" />;
        }
      })}
    </div>
  );
};

export default StarRating;
