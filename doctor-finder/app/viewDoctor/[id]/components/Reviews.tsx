"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db as getFirebaseDb } from "../../../authcontext";

interface Review {
  id: string;
  user: string;
  comment: string;
  datetime: string;
}

interface ReviewsHistoryProps {
  doctorId: string;
}

export default function ReviewsHistory({ doctorId }: ReviewsHistoryProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!doctorId) return;

      setLoading(true);
      setError(null);
      const db = getFirebaseDb();

      // get reviews for this doc
      try {
        const reviewsQuery = query(collection(db, "reviews"), where("doctorId", "==", doctorId));
        const reviewSnapshot = await getDocs(reviewsQuery);

        const fetchedReviews: Review[] = reviewSnapshot.docs.map((doc) => ({
          id: doc.id,
          user: doc.data().reviewedBy || "Anonymous",
          comment: doc.data().review || "No comment provided.",
          datetime: doc.data().updatedAt?.toDate().toLocaleString() || "Unknown date",
        }));

        setReviews(fetchedReviews);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError("Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [doctorId]);

  return (
    <div className="mt-4 p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md">
      {loading ? (
        <p>Loading reviews...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="p-4 border-b border-gray-200 dark:border-zinc-700">
            <p className="font-semibold">{review.user}</p>  {/*displays user id rn */}
            <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
            <p className="text-xs text-gray-400">{review.datetime}</p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}
