
import aiohttp
import asyncio
import json
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
            async with session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        "doi": data.get("doi"),
                        "cited_by_count": data.get("cited_by_count", 0),
                        "abstract": await reconstruct_abstract(data.get("abstract_inverted_index"))
                    }
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

        return {res['doi']: res for res in results if res}

    @staticmethod
    def extract_dois(links):
        return [link.replace("https://doi.org/", "").strip() for link in links if "https://doi.org/" in link]



unique_dois = [
"10.1145/3308774.3308802",
"10.48550/arXiv.2305.14772",
"10.18653/v1/2023.findings-emnlp.322",
"10.48550/arXiv.2301.10140",
"10.18653/v1/2021.findings-emnlp.225",
"10.18653/v1/2022.findings-naacl.6",
"10.18653/v1/2023.acl-demo.32",
"10.48550/arXiv.2305.14987",
"10.48550/arXiv.2411.04075",
"10.48550/arXiv.2501.06590",
"10.18653/v1/D19-1383",
"10.18653/v1/2023.findings-emnlp.996",
"10.48550/arXiv.2309.08963",
"10.18653/v1/2023.clinicalnlp-1.7",
"10.18653/v1/2020.acl-demos.41",
"10.1145/3404835.3463254",
"10.48550/arXiv.2311.10537",
]

# Fetch OpenAlex data for all DOIs
results = openalex_data = asyncio.run(OpenAlexFetcher.fetch_openalex_data(unique_dois))
[res for res in results if res is not None]  # Remove failed queries

open

with open("some_dump.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=4)
