import pandas as pd
from rapidfuzz import process, fuzz  # Use rapidfuzz instead of fuzzywuzzy for better performance


def fuzzy_match(df, search_string, col1='name', col2='abbreviation', threshold=80):
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
        return matched_row['rank'].values[0]
    
    return None