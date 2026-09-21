import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut as fbSignOut, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Google Auth Provider configured with Google Drive scopes
export const driveProvider = new GoogleAuthProvider();
driveProvider.addScope('https://www.googleapis.com/auth/drive.file');
driveProvider.addScope('https://www.googleapis.com/auth/drive.readonly');
driveProvider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory access token cache (MANDATORY: NEVER persist in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
}

export const initDriveAuth = (
  onSuccess?: (user: User, token: string) => void,
  onSignedOut?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onSuccess) onSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        cachedAccessToken = null;
        if (onSignedOut) onSignedOut();
      }
    }
  });
};

export const signInWithGoogleDrive = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Haikuweza kupokea kibali cha Google Drive (Access Token).');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Hitilafu ya kuingia Google Drive:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleDrive = async (): Promise<void> => {
  await fbSignOut(auth);
  cachedAccessToken = null;
};

export const getCachedDriveToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * List AfyaLishe files or reports on Google Drive
 */
export const listAfyaLisheDriveFiles = async (folderOrQuery?: string): Promise<DriveFileItem[]> => {
  if (!cachedAccessToken) {
    throw new Error('Tafadhali ingia kwanza kwenye Google Drive.');
  }

  let q = "trashed = false and (name contains 'AfyaLishe' or name contains 'Ripoti_ya_Lishe' or name contains 'Mlo')";
  if (folderOrQuery) {
    q = `trashed = false and (${folderOrQuery})`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,createdTime,modifiedTime,webViewLink,webContentLink,size)&orderBy=modifiedTime desc&pageSize=20`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Hitilafu ya kupakua orodha ya faili za Google Drive');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Upload a report or diet plan file to Google Drive
 */
export const uploadReportToGoogleDrive = async (
  fileName: string,
  content: Blob | string,
  mimeType: string = 'application/json',
  description?: string
): Promise<DriveFileItem> => {
  if (!cachedAccessToken) {
    throw new Error('Tafadhali unganisha Google Drive kwanza kabla ya kuhifadhi.');
  }

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    description: description || 'Ripoti ya Lishe na Sukari - AfyaLishe App',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  
  const fileBlob = typeof content === 'string' 
    ? new Blob([content], { type: mimeType }) 
    : content;
  form.append('file', fileBlob);

  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,createdTime';

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Imeshindikana kupakia faili kwenye Google Drive');
  }

  const uploadedFile = await response.json();
  return uploadedFile;
};

/**
 * Delete a file from Google Drive (Mandatory Confirmation must occur before calling this)
 */
export const deleteFileFromDrive = async (fileId: string): Promise<void> => {
  if (!cachedAccessToken) {
    throw new Error('Hakuna ruhusa ya Google Drive.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || 'Imeshindikana kufuta faili');
  }
};
