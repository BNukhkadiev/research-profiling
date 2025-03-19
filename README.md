# Research Profiling Project

A powerful web-based platform for exploring researcher profiles, their publications, co-authorship networks, and research topics. The application aggregates data from multiple sources (DBLP, Semantic Scholar, ArXiv, ACM, CORE, OpenAlex, GitHub, Hugging Face) to provide comprehensive researcher insights.


- **Researcher Profiles** with detailed statistics 
- **Publication Analysis** including citation counts, h-index, and g-index 
- **Common Research Topics Extraction** using LLMs 
- **Coauthor Network Insights** 
- **Integration with GitHub & Hugging Face** for open-source contributions 

## Features
**Researcher Search & Profile Page**: Retrieve data from DBLP, Semantic Scholar, etc.
**Dynamic Publication Filtering**: Filter publications by year, venue, and ranking.
**Real-Time Citation & Index Calculation**: Compute h-index, g-index, and citation counts dynamically.
**Coauthor Network Analysis**: Identify key collaborations & co-publications.
**Common Research Topics Extraction**: Uses LLM to generate topics from abstracts.
**GitHub & Hugging Face Integration**: Fetch repositories, models, and datasets.
**Comparison Feature**: Compare multiple researchers side-by-side.

## Tech Stack
- **Frontend**: React (TypeScript) + Material UI
- **Backend**: Django + Django REST Framework
- **Database**: PostgreSQL + MongoDB (for caching)
- **AI Models**: LLM-based topic extraction (Ollama Mistral Model)
- **Data Sources**: DBLP, Semantic Scholar, OpenAlex, ArXiv, CORE

## Installation & Setup
### Clone the Repository
```sh
git clone https://github.com/yourusername/researcher-profile.git
cd researcher-profile
```

### Backend Setup (Django)
```sh
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup (React)
```sh
cd frontend
npm install
npm run dev  # Start frontend
```

### Database Setup
- PostgreSQL: Ensure PostgreSQL is running, and update `DATABASES` in `settings.py`.
- MongoDB: Used for caching API responses, install and start MongoDB.

---

## Database Setup

### BaseX (For DBLP Data)
BaseX is used to store and query **DBLP XML** data. Follow the installation guide here: [BaseX Installation](https://basex.org/download)

#### Create a database from **dblp.xml**
1. Download the latest **DBLP XML dataset** from:
   [DBLP XML](https://dblp.uni-trier.de/xml/)
2. Open BaseX GUI or run:
   ```sh
   basexclient -U admin -P admin
   CREATE DB dblp /path/to/dblp.xml;
   ```
3. Ensure BaseX is running when using the application.

### MongoDB (For Caching API Data)
MongoDB is used to cache researcher profiles and reduce redundant API calls.

#### Install MongoDB
- [MongoDB Installation Guide](https://www.mongodb.com/docs/manual/installation/)


---

## API Endpoints
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/researcher-profile/?author_name=<name>` | Fetch researcher data |
| POST | `/api/generate-topics/` | Generate topics using LLM |
| POST | `/api/open-alex/` | Fetch OpenAlex citations |
| GET | `/api/github-profile/?name=<name>` | Fetch GitHub repositories |
| GET | `/api/huggingfacedata/?name=<name>` | Fetch Hugging Face models |

---


