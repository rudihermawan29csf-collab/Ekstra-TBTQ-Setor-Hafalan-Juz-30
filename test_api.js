const fetch = require('node-fetch');
async function test() {
  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbz6q1fp7yKLHko2N_HElQ63HpAjFLPyRvYTlSiqTy-mo1nkoyaDIONhkchhhgvCbO1qoA/exec", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({ action: "get_users" })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch(e) {
    console.error(e);
  }
}
test();
