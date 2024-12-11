import React, { useState, useEffect } from "react";
import '../styles/Researcher.css';

// Define the Researcher interface
interface Researcher {
  name: string;
  photo: string;
  position: string;
  awards: string[];
  papers: number;
  hIndex: number;
  citations: number;
  publications: Publication[];
  repositories: Repository[];
}

interface Publication {
  title: string;
  date: string;
  venue: string;
  coreRanking: string;
  topic: string;
  citations: number;
}

interface Repository {
  name: string;
  stars: number;
  url: string;
}

const ResearcherPage: React.FC = () => {
  const [researcher, setResearcher] = useState<Researcher | null>(null);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [filters, setFilters] = useState({
    date: "",
    venue: "",
    coreRanking: "",
    sort: "",
    topic: "",
  });

  // Fetch the researcher data from the API
  useEffect(() => {
    const fetchResearcherData = async () => {
      try {
        const response = await fetch("/api/researcher"); // Replace with your actual API endpoint
        const data: Researcher = await response.json();
        setResearcher(data);
        setFilteredPublications(data.publications);
      } catch (error) {
        console.error("Error fetching researcher data:", error);
      }
    };
    fetchResearcherData();
  }, []);

  // Handle filters
  useEffect(() => {
    if (researcher) {
      let filtered = researcher.publications;

      // Apply filters one by one
      if (filters.date) {
        filtered = filtered.filter((pub) => pub.date.includes(filters.date));
      }
      if (filters.venue) {
        filtered = filtered.filter((pub) => pub.venue.includes(filters.venue));
      }
      if (filters.coreRanking) {
        filtered = filtered.filter((pub) => pub.coreRanking === filters.coreRanking);
      }
      if (filters.topic) {
        filtered = filtered.filter((pub) => pub.topic.includes(filters.topic));
      }
      if (filters.sort === "citations") {
        filtered = filtered.sort((a, b) => b.citations - a.citations);
      }

      setFilteredPublications(filtered);
    }
  }, [filters, researcher]);

  if (!researcher) {
    return <div>Loading...</div>;
  }

  return (
    <div className="researcher-container">
      <div className="header">
        <div className="logo">MannheimView</div>
        <div className="profile-icon">👤</div>
      </div>

      <div className="profile-overview">
        <div className="photo">
          <img src={researcher.photo} alt={researcher.name} />
        </div>
        <div className="details">
          <h1>{researcher.name}</h1>
          <p>{researcher.position}</p>
          <p className="awards">{researcher.awards.join(", ")}</p>
        </div>
      </div>

      <div className="stats-section">
        <div className="stat-box">
          <h3>{researcher.papers}</h3>
          <p>Papers</p>
        </div>
        <div className="stat-box">
          <h3>{researcher.hIndex}</h3>
          <p>H-Index</p>
        </div>
        <div className="stat-box">
          <h3>{researcher.citations}</h3>
          <p>Citations</p>
        </div>
      </div>

      <div className="content-section">
        <div className="filters">
          <h2>Publications</h2>
          <div className="filter-controls">
            <input
              type="text"
              placeholder="Date (YYYY)"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="Venue"
              value={filters.venue}
              onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
            />
            <select
              value={filters.coreRanking}
              onChange={(e) => setFilters({ ...filters, coreRanking: e.target.value })}
            >
              <option value="">CORE Ranking</option>
              <option value="A*">A*</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
            <input
              type="text"
              placeholder="Topic"
              value={filters.topic}
              onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
            />
            <button onClick={() => setFilters({ ...filters, sort: "citations" })}>
              Sort by Citations
            </button>
          </div>
        </div>

        <div className="publications">
          {filteredPublications.map((pub, index) => (
            <div key={index} className="publication-card">
              <h3>{pub.title}</h3>
              <p>
                {pub.date} | {pub.venue} | {pub.coreRanking}
              </p>
              <p>Topic: {pub.topic}</p>
              <p>Citations: {pub.citations}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="repositories-section">
        <h2>Repositories (HuggingFace & GitHub)</h2>
        <div className="repositories">
          {researcher.repositories.map((repo, index) => (
            <div key={index} className="repo-card">
              <a href={repo.url} target="_blank" rel="noopener noreferrer">
                {repo.name}
              </a>
              <p>⭐ {repo.stars} Stars</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResearcherPage;
