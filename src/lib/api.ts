export const APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6Vs0TtQLd-4OhTtjmQJkb-haksRVc_hL-ssPtSWX_AYUoj8mBls8DjDi5gHDwvhbljQ/exec";

export async function callAppScript(action: string, payload: any = {}) {
  try {
    const response = await fetch(APPSCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain' // Must use text/plain for Google Apps Script CORS
      },
      body: JSON.stringify({ action, ...payload })
    });
    
    if (!response.ok) {
      throw new Error('Terjadi kesalahan jaringan');
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Terjadi kesalahan pada sistem');
    }

    return data.data;
  } catch (error: any) {
    console.error(`API Error [${action}]:`, error);
    throw error;
  }
}
