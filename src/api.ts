import fetch from 'node-fetch'

export function useAPIs(projectName: string, token: string) {
  const option = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `connect.sid=${token}; Path=/; Secure; HttpOnly;`,
    },
  }

  return {
    searchByQuery: function (searchQuery: string): [req: Promise<any>, ctl: AbortController] {
      const ctl = new AbortController()
      const signal = ctl.signal

      return [
        fetch(encodeURI(`https://scrapbox.io/api/pages/${projectName}/search/query?q=${searchQuery}`), {
          ...option,
          signal,
        }),
        ctl,
      ]
    },
    fetchRecentlyAccessedPages: async function () {
      return fetch(encodeURI(`https://scrapbox.io/api/pages/${projectName}?sort=accessed&limit=1000`), option)
    },
  }
}
