const axios = require('axios');
const search = 'grand blue';
const queryStr = `
  query($search: String) {
    Page(page: 1, perPage: 5) {
      media(type: ANIME, search: $search) {
        title { romaji }
      }
    }
  }
`;
axios.post('https://graphql.anilist.co', { query: queryStr, variables: { search } })
  .then(r => console.log(r.data.data.Page.media))
  .catch(console.error);
