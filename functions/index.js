import { initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { createApi } from './api.js';
initializeApp();
export const api = onRequest({region:'europe-west1',maxInstances:2,minInstances:0},createApi());
