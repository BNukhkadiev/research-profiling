from BaseXClient import BaseXClient
import xml.etree.ElementTree as ET
import logging

logger = logging.getLogger(__name__)



def get_author_affiliations(author_query: str, limit=5) -> dict:
    """
    Search for author names in DBLP and return a dictionary:
    {
        'Author Name': [list of affiliations],
        ...
    }
    """
    # Prepare the query string
    xquery = f"""
    let $author_name := lower-case('{author_query}')

    let $exact :=
      for $entry in //www
      let $author := lower-case(normalize-space(string-join($entry/author, ' ')))
      where $author = $author_name
      return element result {{
        attribute type {{ "exact" }},
        <author>{{ $entry/author }}</author>,
        for $aff in $entry/note[@type='affiliation']
        return <affiliation label="{{ $aff/@label }}">{{ $aff/text() }}</affiliation>
      }}

    let $partial :=
      for $entry in //www[author contains text {{ $author_name }} using fuzzy]
      let $author := lower-case(normalize-space(string-join($entry/author, ' ')))
      where $author != $author_name
      return element result {{
        attribute type {{ "partial" }},
        <author>{{ $entry/author }}</author>,
        for $aff in $entry/note[@type='affiliation']
        return <affiliation label="{{ $aff/@label }}">{{ $aff/text() }}</affiliation>
      }}

    let $partial_limited := subsequence($partial, 1, 10)

    return ($exact, $partial_limited)

    """

    results_dict = {}

    try:
        session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
        session.execute("OPEN dblp")
        result = session.execute(f'XQUERY {xquery}')
        session.close()

        # Wrap result in root tag for proper XML parsing
        root = ET.fromstring(f"<results>{result}</results>")

        for res in root.findall('result'):
            author_container = res.find('author')
            if author_container is not None:
                authors = [a.text for a in author_container.findall('author')]
                affiliations = [
                    aff.text for aff in res.findall('affiliation') if aff.text
                ]
                for author in authors:
                    # If same author appears multiple times, merge affiliations
                    if author in results_dict:
                        results_dict[author].extend(a for a in affiliations if a not in results_dict[author])
                    else:
                        results_dict[author] = affiliations

    except Exception as e:
        print(f"Error during BaseX query: {e}")

    return results_dict

def get_publication_titles(author_name, limit=10):
    """Fetch and parse publication titles for a given author."""
    session = BaseXClient.Session('localhost', 1984, 'admin', 'admin')
    publications = []

    try:
        session.execute("OPEN dblp")

        query_text = f"""
        let $author_name := '{author_name}'
        for $pub in //(article|inproceedings|book|incollection|phdthesis|mastersthesis|proceedings|www|data)
        where $pub/author = $author_name
        return $pub
        """

        query = session.query(query_text)

        for _, item in query.iter():
            try:
                elem = ET.fromstring(item)
                title = elem.findtext("title")
                if title:
                    publications.append(title.strip())
            except ET.ParseError as e:
                logger.error(f"Parse error: {e} on item: {item}")

        query.close()
        return list(dict.fromkeys(publications))[:limit]  # Deduplicate and limit

    finally:
        session.close()

authors = get_author_affiliations('Rainer').keys()
result = {}
for author in authors:
    result[author] = get_publication_titles(author)

print(result)