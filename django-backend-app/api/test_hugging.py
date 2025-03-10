import requests

def get_huggingface_resources(username):
    """
    Fetch models and datasets associated with a Hugging Face username.
    """
    models_url = f"https://huggingface.co/api/models?author={username}"
    datasets_url = f"https://huggingface.co/api/datasets?author={username}"

    models = requests.get(models_url).json()
    datasets = requests.get(datasets_url).json()

    model_links = [f"https://huggingface.co/{model['id']}" for model in models if 'id' in model]
    dataset_links = [f"https://huggingface.co/datasets/{dataset['id']}" for dataset in datasets if 'id' in dataset]

    return model_links, dataset_links

def generate_possible_usernames(first_name, last_name):
    """
    Generate possible Hugging Face usernames based on common patterns.
    """
    first_name = first_name.lower()
    last_name = last_name.lower()

    return [
        f"{first_name}{last_name}",
        f"{first_name}_{last_name}",
        f"{first_name}.{last_name}",
        f"{first_name}-{last_name}",
        f"{first_name}{last_name[0]}",  # First name + first letter of last name
        f"{first_name[0]}{last_name}",  # First letter of first name + last name
        f"{first_name}{last_name[:3]}",  # First name + first 3 letters of last name
        f"{last_name}{first_name}",  # Reverse order
        f"{first_name[0]}{last_name[0]}",  # Initials
    ]

def find_valid_username(first_name, last_name):
    """
    Check Hugging Face API for valid usernames from generated possibilities.
    """
    for username in generate_possible_usernames(first_name, last_name):
        # Check if the user has any models
        response = requests.get(f"https://huggingface.co/api/models?author={username}")
        if response.status_code == 200 and response.json():
            return username
    return None

def main():
    first_name = input("Enter First Name: ").strip()
    last_name = input("Enter Last Name: ").strip()

    username = find_valid_username(first_name, last_name)

    if username:
        print(f"Found Hugging Face username: {username}")
        models, datasets = get_huggingface_resources(username)

        print("\nModels:")
        for model in models:
            print(model)

        print("\nDatasets:")
        for dataset in datasets:
            print(dataset)
    else:
        print("No valid Hugging Face username found.")

if __name__ == "__main__":
    main()
