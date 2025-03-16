import { Star, } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import React, { useState } from "react";
import { X } from "lucide-react";

export default function ReviewCard() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  {/*need to style and use components correctly, just testing */}
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
      
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Write a Review</h2>
        <Button className="text-gray-400 hover:text-gray-600">
          <X size={20} />
        </Button>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <h3 className="text-base font-semibold">Dr. Racheal Daniels, MD</h3>
          <p className="text-sm text-gray-500">Internal Medicine</p>
          <p className="text-sm text-gray-500">301 Maple St, Denton, TX 76201</p>
        </div>
      </div>

      <hr className="my-4" />

      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl ${
              rating >= star ? "text-blue-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        className="w-full mt-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={4}
        placeholder="Write a review for this doctor..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />

      <button
        className="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
      >
        Submit
      </button>
    </div>
  );
}
