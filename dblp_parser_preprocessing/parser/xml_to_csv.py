#!/usr/bin/env python3
import argparse
import csv
import os
import sys
from lxml import etree

def existing_file(path: str) -> str:
    """
    Ensure `path` is an existing file.
    Raises an error if the file does not exist.
    """
    if not os.path.isfile(path):
        raise argparse.ArgumentTypeError(f"Not a valid file: {path}")
    return path

def parse_args():
    """
    Parse command-line arguments.
    Expects two arguments:
      - `xml_filename`: Path to the input XML file (either `dblp.xml` or a single-person `pid/NN.xml`).
      - `output_csv`: Path to the CSV output file.
    """
    parser = argparse.ArgumentParser(
        description="Extract person affiliation info from either dblp.xml or a single-person dblpperson file."
    )
    parser.add_argument("xml_filename", type=existing_file,
                        help="Path to either dblp.xml or a pid/NN.xml single-person file.")
    parser.add_argument("output_csv",
                        help="Path to the CSV output (e.g. authors.csv).")
    return parser.parse_args()

def extract_person_info(person_elem):
    """
    Extract author and affiliation details from a given <person> XML element.
    Returns:
      - List of author names
      - List of ORCID identifiers
      - List of affiliation texts
      - List of affiliation labels (if any exist)
    """
    author_names = []
    author_orcids = []
    affiliations = []
    affiliation_labels = []

    for child in person_elem:
        if child.tag == "author":
            text = (child.text or "").strip()
            if text:
                author_names.append(text)
            orcid = (child.get("orcid") or "").strip()
            if orcid:
                author_orcids.append(orcid)
        elif child.tag == "note" and (child.get("type") or "") == "affiliation":
            aff_text = (child.text or "").strip()
            if aff_text:
                affiliations.append(aff_text)
            lab = (child.get("label") or "").strip()
            if lab:
                affiliation_labels.append(lab)

    return author_names, author_orcids, affiliations, affiliation_labels

def parse_single_person(xml_filename, output_csv):
    """
    Parse a single-person XML file where the root element is <dblpperson>.
    Extracts the author's details and affiliations and writes them to a CSV file.
    """
    tree = etree.parse(xml_filename)
    root = tree.getroot()  # Should be <dblpperson>

    # Find the <person> child element
    person_elem = root.find("person")
    if person_elem is None:
        print("No <person> element found under <dblpperson>; no rows written.")
        return

    # Extract relevant author and affiliation information
    author_names, author_orcids, affiliations, aff_labels = extract_person_info(person_elem)

    # Write data to CSV file
    with open(output_csv, "w", newline="", encoding="utf-8") as outf:
        writer = csv.DictWriter(outf,
                                fieldnames=["key", "author_names", "author_orcids",
                                            "affiliations", "affiliation_labels"],
                                delimiter=";")
        writer.writeheader()

        rec_key = (person_elem.get("key") or "").strip()

        if author_names or affiliations:
            writer.writerow({
                "key": rec_key,
                "author_names": "|".join(author_names),
                "author_orcids": "|".join(author_orcids),
                "affiliations": "|".join(affiliations),
                "affiliation_labels": "|".join(aff_labels)
            })

def parse_dblp(xml_filename, output_csv):
    """
    Parse the full `dblp.xml` file using `iterparse` to extract authors and affiliations.
    Processes records incrementally to avoid excessive memory usage.
    """
    RECORD_TAGS = {
        "article", "inproceedings", "proceedings", "book",
        "incollection", "phdthesis", "mastersthesis", "www",
        "data", "person"
    }

    with open(output_csv, "w", newline="", encoding="utf-8") as outf:
        writer = csv.DictWriter(outf,
                                fieldnames=["record_tag", "key",
                                            "author_names", "author_orcids",
                                            "affiliations", "affiliation_labels"],
                                delimiter=";")
        writer.writeheader()

        context = etree.iterparse(
            xml_filename,
            events=("end",),
            load_dtd=False,
            resolve_entities=True
        )

        total_records = 0
        written_rows = 0

        for event, elem in context:
            if elem.tag in RECORD_TAGS:
                total_records += 1
                rec_key = (elem.get("key") or "").strip()

                author_names, author_orcids, affiliations, affiliation_labels = extract_person_info(elem)

                if author_names or affiliations:
                    writer.writerow({
                        "record_tag": elem.tag,
                        "key": rec_key,
                        "author_names": "|".join(author_names),
                        "author_orcids": "|".join(author_orcids),
                        "affiliations": "|".join(affiliations),
                        "affiliation_labels": "|".join(affiliation_labels)
                    })
                    written_rows += 1

                elem.clear()
        
        del context

    print(f"Parsed {total_records} total <{RECORD_TAGS}> elements; wrote {written_rows} rows to {output_csv}.")

def main():
    """
    Main function to determine whether the input XML file is a full `dblp.xml` or a single-person `dblpperson.xml`.
    Calls the appropriate parsing function accordingly.
    """
    args = parse_args()

    root_tag = None
    # Detect the root element to determine file type
    with open(args.xml_filename, "rb") as f:
        for event, elem in etree.iterparse(f, events=("start",), load_dtd=False):
            root_tag = elem.tag
            break

    if root_tag == "dblpperson":
        print("Detected a single-person file (<dblpperson> root).")
        parse_single_person(args.xml_filename, args.output_csv)
    elif root_tag == "dblp":
        print("Detected the full dblp.xml (<dblp> root).")
        parse_dblp(args.xml_filename, args.output_csv)
    else:
        print(f"ERROR: Unrecognized root element <{root_tag}>. Not dblp or dblpperson.")
        sys.exit(1)

if __name__ == "__main__":
    main()
