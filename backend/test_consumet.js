const { ANIME } = require("@consumet/extensions")

async function test(providerName) {
  try {
    const provider = new ANIME[providerName]()
    const searchRes = await provider.search("naruto")
    if (searchRes.results.length > 0) {
      console.log(`[SUCCESS] ${providerName} works!`)
    }
  } catch (err) {
    console.log(`[FAILED] ${providerName} - ${err.message}`)
  }
}

async function run() {
  const providers = ['Zoro', '9anime', 'Gogoanime', 'AnimePahe', 'Crunchyroll', 'Bilibili']
  for (const p of providers) {
    if (ANIME[p]) await test(p)
  }
}
run()
