# openalex_service.py

import aiohttp
import asyncio
import logging

logger = logging.getLogger(__name__)

class OpenAlexFetcher:
    @staticmethod
    async def fetch_openalex_data(dois):
        async def reconstruct_abstract(inverted_index):
            if not inverted_index:
                return None
            position_word = {pos: word for word, positions in inverted_index.items() for pos in positions}
            return " ".join([position_word[pos] for pos in sorted(position_word.keys())])

        async def fetch_work(session, doi):
            url = f"https://api.openalex.org/works/https://doi.org/{doi}?select=id,doi,title,cited_by_count,abstract_inverted_index"
            
            await asyncio.sleep(1)  # ⏱️ Wait 1 second before sending request

            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info("Fetched pub with DOI: {url}")
                    return {
                        "doi": data.get("doi"),
                        "cited_by_count": data.get("cited_by_count", 0),
                        "abstract": await reconstruct_abstract(data.get("abstract_inverted_index"))
                    }
                elif response.status == 429:
                    logger.warning(f"OpenAlex fetch rate-limited for DOI {doi}")
                    return {"doi": doi, "error": 429}
                else:
                    logger.warning(f"OpenAlex fetch failed for DOI {doi}: {response.status}")
                    return None


        semaphore = asyncio.Semaphore(1)

        async def bound_fetch(doi):
            async with semaphore:
                return await fetch_work(session, doi)

        async with aiohttp.ClientSession() as session:
            tasks = [bound_fetch(doi) for doi in dois]
            results = await asyncio.gather(*tasks)

        # If any result had a 429, return a signal to caller
        if any(res.get("error") == 429 for res in results if res):
            return {"error": 429}

        # Otherwise return valid data
        return {res['doi']: res for res in results if res and "doi" in res}

    @staticmethod
    def extract_dois(links):
        return [link.replace("https://doi.org/", "").strip() for link in links if "https://doi.org/" in link]
