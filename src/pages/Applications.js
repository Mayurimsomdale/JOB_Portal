import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // Import useParams

const Applicants = () => {
  const { jobId } = useParams(); // Get jobId from URL
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    if (jobId) {
      axios.get(`http://localhost:8081/api/jobs/${jobId}/applicants`)
        .then((res) => setApplicants(res.data))
        .catch((err) => console.error("Error fetching applicants:", err));
    }
  }, [jobId]);

  return (
    <div>
      <h2>Applicants for this Job</h2>
      <ul>
        {applicants.length > 0 ? (
          applicants.map((applicant, index) => (
            <li key={index}>
              <p>Name: {applicant.name}</p>
              <p>Email: {applicant.email}</p>
              <a href="some-link" target="_blank" rel="noopener noreferrer">Click here</a>
            </li>
          ))
        ) : (
          <p>No applicants found.</p>
        )}
      </ul>
    </div>
  );
};

export default Applicants;
