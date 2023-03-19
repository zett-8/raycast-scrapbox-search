import { useEffect, useState } from "react";
import { Action, ActionPanel, getPreferenceValues, List, LocalStorage, Icon } from "@raycast/api";
import { useCachedState } from "@raycast/utils";

import { useAPIs } from "./api";
import { Page, SearchResult, Preferences } from "./types";

let timer: ReturnType<typeof setTimeout>;

function Command() {
  const { projectName, token } = getPreferenceValues<Preferences>();

  const [pages, setPages] = useState<Page[] | null>([]);
  const [query, setQuery] = useState<string>("");
  const [cachedPages, setCachedPages] = useCachedState<Page[] | null>("cachedPages");
  const [filteredPages, setFilteredPages] = useState<Page[] | null>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const api = useAPIs(projectName, token);

  const searchByQuery = async (query: string) => {
    if (!query) {
      setPages([]);
      return;
    }

    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      setIsLoading(true);
      const res = await api.searchByQuery(query);
      setIsLoading(false);

      const json = (await res.json()) as SearchResult;
      json?.pages && setPages(json.pages);
    }, 100);
  };

  const filterCachedPages = (query: string) => {
    if (!query) {
      setFilteredPages([]);
      return;
    }

    const tokens = query.toLowerCase().split(" ");

    const filtered = cachedPages?.filter((page: Page) => {
      const title = page.title.toLowerCase();
      return tokens.every((token) => title.includes(token));
    });

    setFilteredPages(filtered || []);
  };

  const loadCachedPages = async () => {
    const cache = (await LocalStorage.getItem("cachedPages")) || "[]";
    const cachedPages: Page[] = JSON.parse(String(cache));

    cachedPages.length && setCachedPages(cachedPages);
  };

  const fetchRecentlyAccessedPages = async () => {
    const res = await api.fetchRecentlyAccessedPages();
    const json = (await res.json()) as SearchResult;
    json?.pages && setCachedPages(json.pages);
  };

  useEffect(() => {
    loadCachedPages();
    fetchRecentlyAccessedPages();
  }, []);

  useEffect(() => {
    filterCachedPages(query);
    searchByQuery(query);
  }, [query]);

  return (
    <List isLoading={isLoading} onSearchTextChange={(q) => setQuery(q)}>
      {query && !isLoading && pages?.length === 0 && (
        <List.Section title="Create new page">
          <List.Item
            key={query}
            icon={Icon.Pencil}
            title={query}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  url={encodeURI(`https://scrapbox.io/${projectName}/${query}`)}
                ></Action.OpenInBrowser>
              </ActionPanel>
            }
          />
        </List.Section>
      )}

      <List.Section title="Search">
        {pages?.map((page: Page) => (
          <List.Item
            key={page.id}
            icon={Icon.MagnifyingGlass}
            title={page.title}
            subtitle={page.lines?.[0] || ""}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  url={encodeURI(`https://scrapbox.io/${projectName}/${page.title}`)}
                ></Action.OpenInBrowser>
              </ActionPanel>
            }
          />
        ))}
      </List.Section>

      <List.Section title="Recent Titles">
        {filteredPages?.length
          ? filteredPages?.map((page: Page) => (
              <List.Item
                key={page.id}
                icon={Icon.Clock}
                title={page.title}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser
                      url={encodeURI(`https://scrapbox.io/${projectName}/${page.title}`)}
                    ></Action.OpenInBrowser>
                  </ActionPanel>
                }
              />
            ))
          : cachedPages?.map((page: Page) => (
              <List.Item
                key={page.id}
                icon={Icon.Clock}
                title={page.title}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser
                      url={encodeURI(`https://scrapbox.io/${projectName}/${page.title}`)}
                    ></Action.OpenInBrowser>
                  </ActionPanel>
                }
              />
            ))}
      </List.Section>
    </List>
  );
}

export default Command;
