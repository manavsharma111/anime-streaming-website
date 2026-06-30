async function test() {
  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?page=1');
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2).slice(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();
