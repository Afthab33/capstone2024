'use client';
import React, { useState, useEffect } from 'react';

// Random responses list, I could have put this to external file but this just for a simple project
const randomResponses: string[] = [
  "Please try writing something more descriptive.",
  "Oh! It appears you wrote something I don't understand yet",
  "Do you mind trying to rephrase that?",
  "I'm terribly sorry, I didn't quite catch that.",
  "I can't answer that yet, please try asking something else.",
  "I'm not familiar with that specific issue, but we'll figure it out together.",
  "That's a bit unclear to me. Let's try to get more details and see what we can find.",
  "I need to double-check on that, but I'll get back to you as soon as I have more information.",
  "I don't have that answer at this moment, but I'll make sure you're taken care of and get the right info."
];

interface BotResponse {
  response_type: string;
  user_input: string[];
  bot_response: string;
  required_words: string[];
}

export default function Help() {
  const [userInput, setUserInput] = useState<string>('');
  const [botResponse, setBotResponse] = useState<string>('');
  const [responseData, setResponseData] = useState<BotResponse[]>([]);

  // Load the responses from a JSON file
  const loadJSON = async () => {
    try {
      const response = await fetch('bot.json');
      const data: BotResponse[] = await response.json();
      setResponseData(data);                              // Store the loaded data in the state
    } catch (error) {
      console.error('Error loading JSON:', error);
    }
  };

  useEffect(() => {
    // Load JSON responses on component mount
    loadJSON();
  }, []);

  // Function to match user input with bot response
  const getResponse = (inputString: string): string => {
    const splitMessage: string[] = inputString.toLowerCase().split(/\s+|[,;?!.-]\s*/);
    let bestResponse = '';
    let maxScore = 0;

    // Check each response
    for (const response of responseData) {
      let responseScore = 0;

      if (response.required_words.length > 0) {
        for (const word of splitMessage) {
          if (response.required_words.includes(word)) {
            responseScore += 1;
          }
        }
      }

      if (responseScore === response.required_words.length) {
        for (const word of splitMessage) {
          if (response.user_input.includes(word)) {
            responseScore += 1;
          }
        }
      }

      if (responseScore > maxScore) {
        maxScore = responseScore;
        bestResponse = response.bot_response;
      }
    }

    // If no match is found, return a random response
    if (maxScore === 0) {
      bestResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    }

    return bestResponse;
  };

  // Event handler for input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(event.target.value);
  };

  // Event handler for form submit
  // Sponsor wanted to clear top box after press Ask
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const response = getResponse(userInput);
    setBotResponse(response);

    // Clear input field after submission with hook
    setUserInput('');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-semibold mb-6">Doctor Finder Help Desk</h1>
      <div className="mb-4">
      <textarea
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder={`Doctor Finder at your service?\nAsk me anything in English, Spanish, Mandarin, French, Arabic, Hindi, Bengali, Portuguese, Russian, Japanese, German, Korean, Vietnamese, Italian, Turkish. Future update respond back in native language.`}
        className="px-4 py-2 w-[500px] h-[150px] border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-center resize-none"
      />
      </div>
      <div className="mb-6">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Ask
        </button>
      </div>
      <div className="mt-6 p-4 w-[700px] h-[250px] bg-white border border-gray-300 rounded-lg shadow-md">
        <p className="mt-2">{botResponse}</p>
      </div>
    </div>
  );
}