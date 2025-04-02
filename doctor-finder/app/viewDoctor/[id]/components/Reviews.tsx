"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import StarRating from "./StarRating";
import { doc, getDoc } from "firebase/firestore";
import { db as getFirebaseDb } from "../../../authcontext";
import { Skeleton } from "@/components/ui/skeleton";

interface Review {
  id: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewerImage?: string;
  review: string;
  rating: number;
  createdAt: any;
}

interface ReviewsHistoryProps {
  doctorId: string;
  preloadedReviews?: any[];
  isLoading?: boolean;
  doctorName: string;
}

const ReviewsHistory: React.FC<ReviewsHistoryProps> = ({ 
  doctorId, 
  preloadedReviews,
  isLoading = false,
  doctorName
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    if (preloadedReviews) {
      
      // fetch reviewer details for each review
      const fetchReviewerDetails = async () => {
        const db = getFirebaseDb();
        const enhancedReviews = await Promise.all(
          preloadedReviews.map(async (review) => {
            // if review already has reviewer details, use them
            if (review.reviewerName) {
              return review;
            }
            
            try {
              // get the user ID from reviewedBy field
              const userId = review.reviewedBy;
              
              // get reviewer details from users collection
              if (userId) {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    ...review,
                    reviewerName: `${userData.firstName} ${userData.lastName}`,
                    reviewerImage: userData.profileImage || null
                  };
                } else {
                  console.log(`no user document found for ID: ${userId}`);
                }
              }
              return review;
            } catch (error) {
              console.error('error fetching reviewer details:', error);
              return review;
            }
          })
        );
        
        setReviews(enhancedReviews);
        setLoading(false);
      };
      
      fetchReviewerDetails();
    }
  }, [doctorId, preloadedReviews]);

  if (loading || isLoading) {
    return <ReviewsSkeleton />;
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="rounded-xl p-6">
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Be the first to share your experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 pt-2">
      {reviews.map((review, index) => (
        <div key={review.id}>
          <div className="rounded-xl">
            <div className="flex items-center mb-4">
              {review.reviewerImage ? (
                <div className="w-10 h-10 rounded-full bg-cover bg-center" 
                     style={{ backgroundImage: `url(${review.reviewerImage})` }} />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary dark:bg-primary-/30 flex items-center justify-center text-primary-/20 dark:text-primary-400 font-medium">
                  {review.reviewerName ? review.reviewerName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {review.reviewerName || 'Anonymous'}
                  </p>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(review.createdAt.toDate(), 'MMM d, yyyy')}
                  </span>
                </div>
                <div className="flex items-center -mt-2 ">
                  <StarRating rating={review.rating} />
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-gray-300">
              {review.review}
            </p>
          </div>
          {index < reviews.length - 1 && (
            <hr className="my-5 border-zinc-300 dark:border-zinc-800" />
          )}
        </div>
      ))}
    </div>
  );
};

const ReviewsSkeleton = () => (
  <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1 pt-2">
    {[...Array(1)].map((_, index) => (
      <div key={index}>
        <div className="rounded-xl">
          <div className="mb-3">
            <Skeleton className="h-4 w-24" />
          </div>
          
          <div className="flex items-center mb-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="ml-3 flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="flex items-center -mt-1 -ml-1">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
        {index < 2 && (
          <hr className="my-5 border-zinc-300 dark:border-zinc-800" />
        )}
      </div>
    ))}
  </div>
);

export default ReviewsHistory;
