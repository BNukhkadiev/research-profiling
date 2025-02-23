import requests
import json 

r = requests.post(
    'https://api.semanticscholar.org/graph/v1/paper/batch',
    params={'fields': 'referenceCount,citationCount,title,abstract'},
    json={"ids": ["649def34f8be52c8b66281af98ae884c09aef38b",
                  "ARXIV:2106.15928",
                  "DBLP:conf/acl/LoWNKW20",
                  "DOI:10.1145/3583780.3614895"]}
)
print(json.dumps(r.json(), indent=2))