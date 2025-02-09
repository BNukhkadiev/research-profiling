from keybert import KeyBERT


class KeywordExtractor:
    """
    Keyword extractor class utilized KeyBERT to generate keywords.
    Parameters selected for exraction made up by handpicking and manual testing. 
    extract_keywords method takes a string object. This object would be concatenated abstract and title. 
    The return format is a list of tuples e.g.: 
        [('semi supervised 3d', 0.5629),
        ('semi supervised segmentation', 0.5288),
        ('atrial segmentation challenge', 0.5097),
        ('segmentation consistency training', 0.5018),
        ('predictions image training', 0.4683)]
    Where first element in tuple is a keyword and second is the similarity score with whole doc.
    """
    def __init__(self):
        self.kw_model = KeyBERT()


    def extract_keywords(self, doc:str, keyphrase_ngram_range=(2,3), use_mmr=True, stop_words='english', diversity=0.2):
        keywords = self.kw_model.extract_keywords(doc, 
                                       keyphrase_ngram_range=keyphrase_ngram_range, 
                                       use_mmr=use_mmr, stop_words=stop_words, diversity=diversity)
        return keywords
    
