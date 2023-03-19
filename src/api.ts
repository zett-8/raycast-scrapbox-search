import fetch from "node-fetch";

export function useAPIs(projectName: string, token: string) {
  const option = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `connect.sid=${token}; Path=/; Secure; HttpOnly;`,
    },
  };

  return {
    searchByQuery: async function (searchQuery: string) {
      return fetch(encodeURI(`https://scrapbox.io/api/pages/${projectName}/search/query?q=${searchQuery}`), option);
    },
    fetchRecentlyAccessedPages: async function () {
      return fetch(`https://scrapbox.io/api/pages/${projectName}?sort=accessed&limit=1000`, option);
    },
  };
}
