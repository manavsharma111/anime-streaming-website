async function test() {
  const res = await fetch('http://127.0.0.1:4000/api/v1/anime?limit=30');
  const json = await res.json();
  console.log(json.pagination);
}
test();
