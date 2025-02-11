import pandas as pd


data = pd.read_csv('data/CORE.csv', names=["id", "name", "abbreviation", "source", "rank", "6", "7", "8", "9"])
data = data[['name', 'abbreviation', 'rank']]
data.head(3)

import pandas as pd
from rapidfuzz import process, fuzz  # Use rapidfuzz instead of fuzzywuzzy for better performance

def fuzzy_match(df, search_string, col1, col2, threshold=80):
    """
    Perform fuzzy matching on a given string against two specified columns in the DataFrame.
    Returns the best-matching row along with the column it matched.
    
    :param df: pandas DataFrame
    :param search_string: The string to match
    :param col1: First column to search
    :param col2: Second column to search
    :param threshold: Minimum similarity score to consider a match (default: 80)
    :return: Best matching row (if found) and column name
    """
    # Combine values from both columns
    col1_matches = process.extractOne(search_string, df[col1].dropna(), scorer=fuzz.ratio)
    col2_matches = process.extractOne(search_string, df[col2].dropna(), scorer=fuzz.ratio)
    
    # Determine the best match
    best_match = None
    match_column = None
    
    if col1_matches and col1_matches[1] >= threshold:
        best_match = col1_matches[0]
        match_column = col1
    
    if col2_matches and col2_matches[1] >= threshold:
        if best_match is None or col2_matches[1] > col1_matches[1]:
            best_match = col2_matches[0]
            match_column = col2
    
    if best_match:
        matched_row = df[df[match_column] == best_match]
        return matched_row, match_column
    
    return None, None  # No match found



search_term = "ACM"
matched_row, matched_column = fuzzy_match(data, search_term, 'name', 'abbreviation')

if matched_row is not None:
    print(f"Best match found in column '{matched_column}':")
    print(matched_row)
else:
    print("No suitable match found.")
