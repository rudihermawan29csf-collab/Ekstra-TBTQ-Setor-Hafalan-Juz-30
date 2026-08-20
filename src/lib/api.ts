export async function callAppScript(action: string, payload: any = {}) {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, ...payload })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Terjadi kesalahan jaringan');
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
