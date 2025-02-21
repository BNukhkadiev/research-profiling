import tempfile
import os
import re
import requests
import pdfplumber

def extract_github_links_from_pdf(pdf_url: str):
    """
    Downloads a PDF from 'pdf_url', extracts text for GitHub links, 
    and then removes the temporary PDF file.
    Returns a list of GitHub links found in the PDF text.
    """
    # Create a temporary file (delete=False so we can re-open later on Windows)
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
        pdf_path = tmp_file.name
        # Download the PDF and write its content to the temp file
        response = requests.get(pdf_url)
        tmp_file.write(response.content)

    try:
        # Extract text from the PDF
        with pdfplumber.open(pdf_path) as pdf:
            full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        # Find GitHub links in the extracted text
        github_links = re.findall(r"https?://(?:www\.)?github\.com/\S+", full_text, flags=re.IGNORECASE)
        return github_links

    finally:
        # Always remove the temporary PDF file
        os.remove(pdf_path)


if __name__ == "__main__":
    # Example usage
    pdf_url = "https://arxiv.org/pdf/2305.13059"
    links = extract_github_links_from_pdf(pdf_url)

    print("GitHub links found:")
    for link in links:
        print(link)
