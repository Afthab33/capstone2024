/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

const db = admin.firestore();
const MAPS_CO_API_KEY = '67d8c89e88dee699503139igv8ed6b6';
const RATE_LIMIT_MS = 1100; // slightly over 1 second

let processingPromise = Promise.resolve();

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const geocodeDoctorAddress = onDocumentWritten('users/{userId}', async (event) => {
  const beforeData = event.data?.before?.data();
  const afterData = event.data?.after?.data();
  
  if (!afterData || afterData.role !== 'doctor') {
    return null;    // if the document was deleted or isn't a doctor, exit
  }

  if (!afterData.streetAddress || !afterData.city || !afterData.state || !afterData.zipCode) {
    return null;    // if the address fields are missing, exit
  }

  // check if the address has changed (or is new)
  const addressChanged = 
    !beforeData ||
    beforeData.streetAddress !== afterData.streetAddress ||
    beforeData.city !== afterData.city ||
    beforeData.state !== afterData.state ||
    beforeData.zipCode !== afterData.zipCode;

  // only geocode if address is new or has changed
  if (!addressChanged && afterData.coordinates) {
    return null;
  }

  processingPromise = processingPromise
    .then(() => delay(RATE_LIMIT_MS))
    .then(async () => {
      try {
        // construct the full address
        const address = `${afterData.streetAddress}, ${afterData.city}, ${afterData.state} ${afterData.zipCode}`;
        
        // call maps.co geocoding api
        const response = await axios.get(
          `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${MAPS_CO_API_KEY}`
        );
        
        // check if geocoding was successful
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const firstResult = response.data[0];
          
          // maps.co returns lat/lon as strings, so we need to parse them
          const lat = parseFloat(firstResult.lat);
          const lng = parseFloat(firstResult.lon);
          
          // update the doctor document with coordinates
          const docRef = db.collection('users').doc(event.params.userId);
          await docRef.update({
            coordinates: {
              lat,
              lng
            }
          });
        } else {
          console.error('Geocoding failed: No results found for address', address);
        }
      } catch (error) {
        console.error('Error geocoding doctor address:', error);
      }
    });

  return null;
});
