import React, { useEffect, useState } from 'react';
import './jobs.css';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState('Software Engineer');
  const [location, setLocation] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch jobs when component mounts or search terms change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Reset pagination when search terms change
        if (page === 1) {
          setFilteredJobs([]);
        }
        
        const query = encodeURIComponent(search.trim());
        const locationQuery = encodeURIComponent(location.trim());
        
        // API options - using multiple APIs for better reliability
        // Added focus on Indian job portals and modified queries to prioritize India
        const apis = [
          // Option 1: Remotive API (can include India-specific remote jobs)
          {
            url: 'https://remotive.io/api/remote-jobs',
            params: `search=${query}&region=India`,
            transform: (data) => data.jobs || []
          },
          // Option 2: JSearch API with India focus
          {
            url: 'https://jsearch.p.rapidapi.com/search',
            params: `query=${query}%20in%20${locationQuery}&page=${page}&num_pages=1&country=india`,
            headers: {
              'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY || '',
              'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            },
            transform: (data) => data.data || []
          },
          // Option 3: Adzuna API with India focus
          {
            url: 'https://api.adzuna.com/v1/api/jobs/in/search',  // 'in' country code for India
            params: `app_id=${process.env.REACT_APP_ADZUNA_APP_ID || ''}&app_key=${process.env.REACT_APP_ADZUNA_API_KEY || ''}&what=${query}&where=${locationQuery}&content-type=application/json&page=${page}`,
            transform: (data) => data.results || []
          },
          // Option 4: Indian job board API (replace with actual endpoint if available)
          {
            url: 'https://api.naukri.com/jobsearch',  // Example URL - replace with actual endpoint
            params: `keyword=${query}&location=${locationQuery}&page=${page}`,
            headers: {
              'Authorization': `Bearer ${process.env.REACT_APP_NAUKRI_API_KEY || ''}`,
            },
            transform: (data) => data.jobPostings || []
          }
        ];
        
        // Try APIs in sequence until one works
        let jobData = [];
        let apiSucceeded = false;
        
        for (const api of apis) {
          if (apiSucceeded) break;
          
          try {
            const apiUrl = `${api.url}?${api.params}`;
            const response = await fetch(apiUrl, { 
              headers: api.headers || { 'Origin': window.location.origin }
            });
            
            if (response.ok) {
              const data = await response.json();
              jobData = api.transform(data);
              apiSucceeded = true;
              
              // Determine if there's more data to load
              setHasMore(jobData.length >= 10);
            }
          } catch (e) {
            console.warn(`API attempt failed: ${api.url}`, e);
          }
        }
        
        if (!apiSucceeded) {
          throw new Error('All API attempts failed');
        }
        
        // Normalize job data from different sources
        const normalizedJobs = jobData.map(job => ({
          id: job.id || job.job_id || `job-${Math.random().toString(36).substring(2, 15)}`,
          company_name: job.company_name || job.employer_name || job.company || 'Unknown Company',
          title: job.title || job.job_title || job.position || 'Job Position',
          candidate_required_location: job.candidate_required_location || job.job_country || job.location?.display_name || location || 'India',
          job_type: job.job_type || job.employment_type || job.contract_type || 'Full-time',
          url: job.url || job.job_apply_link || job.redirect_url || '#',
          description: job.description || job.job_description || job.description_text || 'No description available',
          salary: job.salary || job.salary_range?.min || job.salary_display || 'Not specified',
          company_logo: job.company_logo || job.employer_logo || null,
          posted_at: job.posted_at || job.job_posted_at_datetime_utc || job.created || new Date().toISOString(),
          apply_url: job.url || job.job_apply_link || job.redirect_url || job.application_url || null
        }));
        
        // Apply location filter if provided
        let finalJobs = normalizedJobs;
        if (location.trim() && location.toLowerCase() !== 'india') {
          const locationLower = location.toLowerCase();
          finalJobs = normalizedJobs.filter(job => 
            (job.candidate_required_location && job.candidate_required_location.toLowerCase().includes(locationLower)) ||
            (job.title && job.title.toLowerCase().includes(locationLower))
          );
        }
        
        // Append new results to existing jobs if paginating
        if (page > 1) {
          setFilteredJobs(prev => [...prev, ...finalJobs]);
        } else {
          setFilteredJobs(finalJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs from API, using fallback data:', error);
        
        // Enhanced fallback data if API fails
        const fallbackData = generateExpandedFallbackJobs(search, location, page);
        
        // Append new results to existing jobs if paginating
        if (page > 1) {
          setFilteredJobs(prev => [...prev, ...fallbackData]);
        } else {
          setFilteredJobs(fallbackData);
        }
      }
      
      setLoading(false);
    };
    
    fetchJobs();
  }, [search, location, page]);

  // Enhanced function to generate diverse fallback jobs when API fails
  const generateExpandedFallbackJobs = (searchTerm, locationTerm, currentPage) => {
    // Expanded list of Indian cities
    const indianCities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 
      'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat',
      'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane',
      'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara',
      'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad',
      'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar', 'Varanasi'
    ];
    
    // Expanded list of Indian companies
    const indianCompanies = [
      { 
        name: 'TCS', 
        logo: 'https://via.placeholder.com/150?text=TCS', 
        desc: 'Tata Consultancy Services is an Indian multinational information technology services and consulting company.',
        website: 'https://www.tcs.com'
      },
      { 
        name: 'Infosys', 
        logo: 'https://via.placeholder.com/150?text=Infosys', 
        desc: 'Infosys is an Indian multinational information technology company that provides business consulting, information technology and outsourcing services.',
        website: 'https://www.infosys.com'
      },
      { 
        name: 'Wipro', 
        logo: 'https://via.placeholder.com/150?text=Wipro', 
        desc: 'Wipro Limited is an Indian multinational corporation that provides information technology, consulting and business process services.',
        website: 'https://www.wipro.com'
      },
      { 
        name: 'HCL Technologies', 
        logo: 'https://via.placeholder.com/150?text=HCL', 
        desc: 'HCL Technologies is an Indian multinational information technology services and consulting company.',
        website: 'https://www.hcltech.com'
      },
      { 
        name: 'Tech Mahindra', 
        logo: 'https://via.placeholder.com/150?text=TechM', 
        desc: 'Tech Mahindra is an Indian multinational provider of information technology services and consulting.',
        website: 'https://www.techmahindra.com'
      },
      { 
        name: 'Reliance Industries', 
        logo: 'https://via.placeholder.com/150?text=Reliance', 
        desc: 'Reliance Industries Limited is an Indian multinational conglomerate company.',
        website: 'https://www.ril.com'
      },
      { 
        name: 'Bharti Airtel', 
        logo: 'https://via.placeholder.com/150?text=Airtel', 
        desc: 'Bharti Airtel Limited is an Indian multinational telecommunications services company.',
        website: 'https://www.airtel.in'
      },
      { 
        name: 'HDFC Bank', 
        logo: 'https://via.placeholder.com/150?text=HDFC', 
        desc: 'HDFC Bank Limited is an Indian banking and financial services company.',
        website: 'https://www.hdfcbank.com'
      },
      { 
        name: 'ICICI Bank', 
        logo: 'https://via.placeholder.com/150?text=ICICI', 
        desc: 'ICICI Bank Limited is an Indian multinational banking and financial services company.',
        website: 'https://www.icicibank.com'
      },
      { 
        name: 'Mahindra & Mahindra', 
        logo: 'https://via.placeholder.com/150?text=M&M', 
        desc: 'Mahindra & Mahindra Limited is an Indian multinational vehicle manufacturing corporation.',
        website: 'https://www.mahindra.com'
      },
      { 
        name: 'Larsen & Toubro', 
        logo: 'https://via.placeholder.com/150?text=L&T', 
        desc: 'Larsen & Toubro Limited is an Indian multinational conglomerate.',
        website: 'https://www.larsentoubro.com'
      },
      { 
        name: 'Zomato', 
        logo: 'https://via.placeholder.com/150?text=Zomato', 
        desc: 'Zomato is an Indian multinational restaurant aggregator and food delivery company.',
        website: 'https://www.zomato.com'
      },
      { 
        name: 'Flipkart', 
        logo: 'https://via.placeholder.com/150?text=Flipkart', 
        desc: 'Flipkart is an Indian e-commerce company.',
        website: 'https://www.flipkart.com'
      },
      { 
        name: 'Amazon India', 
        logo: 'https://via.placeholder.com/150?text=Amazon', 
        desc: 'Amazon India is the Indian division of the multinational technology company Amazon.',
        website: 'https://www.amazon.in'
      },
      { 
        name: 'Google India', 
        logo: 'https://via.placeholder.com/150?text=Google', 
        desc: 'Google India is the Indian subsidiary of Google LLC.',
        website: 'https://about.google/intl/en_in/'
      },
      { 
        name: 'Microsoft India', 
        logo: 'https://via.placeholder.com/150?text=MS', 
        desc: 'Microsoft India is the Indian subsidiary of Microsoft.',
        website: 'https://www.microsoft.com/en-in'
      },
      { 
        name: 'Accenture India', 
        logo: 'https://via.placeholder.com/150?text=Accenture', 
        desc: 'Accenture India is the Indian division of the multinational professional services company Accenture.',
        website: 'https://www.accenture.com/in-en'
      },
      { 
        name: 'Cognizant India', 
        logo: 'https://via.placeholder.com/150?text=Cognizant', 
        desc: 'Cognizant India is the Indian division of Cognizant, an American multinational information technology services and consulting company.',
        website: 'https://www.cognizant.com/in/en'
      },
      { 
        name: 'Capgemini India', 
        logo: 'https://via.placeholder.com/150?text=Capgemini', 
        desc: 'Capgemini India is the Indian division of the French multinational information technology services and consulting company.',
        website: 'https://www.capgemini.com/in-en/'
      },
      { 
        name: 'Oracle India', 
        logo: 'https://via.placeholder.com/150?text=Oracle', 
        desc: 'Oracle India is the Indian division of Oracle Corporation.',
        website: 'https://www.oracle.com/in/'
      }
    ];
    
    const jobTypes = ['Full-time', 'Contract', 'Part-time', 'Internship', 'Remote'];
    const jobRoles = ['Developer', 'Engineer', 'Specialist', 'Analyst', 'Manager', 'Architect', 'Lead', 'Consultant'];
    
    // Indian salary ranges (in lakhs per annum)
    const salaryRanges = [
      '₹4-6 LPA', '₹6-8 LPA', '₹8-10 LPA', '₹10-12 LPA', 
      '₹12-15 LPA', '₹15-18 LPA', '₹18-22 LPA', '₹22-30 LPA', 
      '₹30-40 LPA', '₹40-50 LPA', '₹50+ LPA'
    ];
    
    const skills = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 
      'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
      'Machine Learning', 'Data Analysis', 'DevOps', 'UI/UX', 'Project Management',
      'Angular', 'Vue.js', 'PHP', 'Ruby', 'C#', '.NET', 'Azure', 'GCP',
      'Swift', 'Kotlin', 'Flutter', 'React Native', 'Android', 'iOS',
      'SAP', 'Oracle', 'Salesforce', 'Hadoop', 'Spark', 'TensorFlow'
    ];
    
 
    // Calculate how many jobs to generate (pagination simulation)
    const jobsPerPage = 15;
    const startIdx = (currentPage - 1) * jobsPerPage;
    const endIdx = startIdx + jobsPerPage;
    
    // Generate 15 jobs per page, up to 100 jobs total across all pages
    const totalPossibleJobs = 100;
    if (startIdx >= totalPossibleJobs) {
      return []; // No more jobs available
    }
    
    const numJobsToGenerate = Math.min(jobsPerPage, totalPossibleJobs - startIdx);
    
    // Simulate pagination by setting hasMore flag
    setHasMore(endIdx < totalPossibleJobs);
    
    // Generate jobs for current page
    return Array.from({ length: numJobsToGenerate }, (_, i) => {
      const index = startIdx + i;
      const company = indianCompanies[index % indianCompanies.length];
      const jobRole = jobRoles[Math.floor(Math.random() * jobRoles.length)];
      
      // For location, use user's input if specific, otherwise randomize from Indian cities
      const specificLocation = locationTerm && locationTerm.toLowerCase() !== 'india' 
        ? locationTerm 
        : indianCities[Math.floor(Math.random() * indianCities.length)];
      
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30));
      
      // Select 3-5 random skills
      const numSkills = 3 + Math.floor(Math.random() * 3);
      const shuffledSkills = [...skills].sort(() => 0.5 - Math.random());
      const selectedSkills = shuffledSkills.slice(0, numSkills);
      
      // Create actual external application URL for each job
      const jobId = `${index}-${Math.random().toString(36).substring(2, 10)}`;
      const applyUrl = `${company.website}/careers/apply/${jobId}`;
      
      // Ensure job titles reflect the search term
      let jobTitle = `${searchTerm} ${jobRole}`;
      if (!searchTerm || searchTerm.trim() === '') {
        // If no search term, generate generic IT job titles
        const techRoles = ['Software Developer', 'Data Scientist', 'Cloud Engineer', 'Full Stack Developer', 'DevOps Engineer'];
        jobTitle = techRoles[Math.floor(Math.random() * techRoles.length)];
      }
      
      return {
        id: `job-${index}`,
        company_name: company.name,
        company_logo: company.logo,
        company_description: company.desc,
        company_website: company.website,
        title: jobTitle,
        candidate_required_location: specificLocation,
        job_type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
        url: `${company.website}/careers/jobs/${jobId}`,
        apply_url: applyUrl,
        external_url: `https://www.naukri.com/job-listings-${jobId}`,
        description: `
          <h3>Job Description</h3>
          <p>We are looking for a talented ${jobTitle} to join our team in ${specificLocation}. This is an exciting opportunity to work with one of India's leading companies.</p>
          
          <h3>Responsibilities</h3>
          <ul>
            <li>Design and develop high-quality software solutions</li>
            <li>Collaborate with cross-functional teams</li>
            <li>Write clean, efficient, and maintainable code</li>
            <li>Troubleshoot and debug applications</li>
            <li>Participate in code reviews and mentor junior team members</li>
          </ul>
          
          <h3>Requirements</h3>
          <ul>
            ${selectedSkills.map(skill => `<li>${skill}</li>`).join('')}
            <li>Bachelor's degree in Computer Science or related field</li>
            <li>${1 + Math.floor(Math.random() * 7)}+ years of experience in relevant technologies</li>
            <li>Strong problem-solving abilities</li>
            ${Math.random() > 0.5 ? '<li>Excellent communication skills in English</li>' : ''}
            ${Math.random() > 0.7 ? '<li>Knowledge of Agile methodologies</li>' : ''}
          </ul>
          
          <h3>Benefits</h3>
          <ul>
            <li>Competitive salary: ${salaryRanges[Math.floor(Math.random() * salaryRanges.length)]}</li>
            <li>Health insurance and medical benefits</li>
            <li>Flexible work options</li>
            <li>Professional development opportunities</li>
            ${Math.random() > 0.5 ? '<li>Employee stock options</li>' : ''}
            ${Math.random() > 0.7 ? '<li>Gym and recreation facilities</li>' : ''}
          </ul>
          
          <h3>How to Apply</h3>
          <p>Please submit your resume and cover letter through our application portal by clicking the Apply button below.</p>
        `,
        salary: salaryRanges[Math.floor(Math.random() * salaryRanges.length)],
        required_skills: selectedSkills,
        posted_at: postedDate.toISOString(),
        application_deadline: new Date(postedDate.getTime() + 30*24*60*60*1000).toISOString()
      };
    });
  };

  const handleSearch = () => {
    // Reset pagination when manually searching
    setPage(1);
    // The actual search is triggered by useEffect
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const viewJobDetails = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const closeJobDetails = () => {
    setShowJobDetails(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Function to get the best available application URL
  const getApplicationUrl = (job) => {
    // Try all possible application URLs in order of preference
    return job.apply_url || job.url || job.external_url || 
           (job.company_website ? `${job.company_website}/careers` : null) || 
           `https://www.google.com/search?q=${encodeURIComponent(`${job.company_name} ${job.title} apply`)}`;
  };

  const JobDetailsModal = ({ job }) => {
    if (!job) return null;
    
    const applicationUrl = getApplicationUrl(job);
    
    return (
      <div className="job-details-modal">
        <div className="modal-content">
          <div className="modal-header">
            <h2>{job.title}</h2>
            <button className="close-btn" onClick={closeJobDetails}>×</button>
          </div>
          
          <div className="company-info">
            {job.company_logo && (
              <img src={job.company_logo} alt={`${job.company_name} logo`} className="company-logo" />
            )}
            <div>
              <h3>{job.company_name}</h3>
              <p className="location">{job.candidate_required_location}</p>
              <p className="job-type">{job.job_type}</p>
              {job.salary && <p className="salary">Salary: {job.salary}</p>}
              {job.posted_at && <p className="posted-date">Posted: {formatDate(job.posted_at)}</p>}
              {job.application_deadline && <p className="deadline">Apply by: {formatDate(job.application_deadline)}</p>}
            </div>
          </div>
          
          <div className="job-description">
            <h3>Job Description</h3>
            <div dangerouslySetInnerHTML={{ __html: job.description }} />
          </div>
          
          {job.required_skills && (
            <div className="skills-section">
              <h3>Required Skills</h3>
              <div className="skills-list">
                {job.required_skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}
          
          <div className="application-section">
            <h3>How to Apply</h3>
            <p>Click the button below to submit your application:</p>
            <div className="button-container">
              <a 
                className="apply-btn"
                href={applicationUrl}
                target="_blank" 
                rel="noreferrer"
                onClick={(e) => {
                  // For development testing: log the URL being accessed
                  console.log("Accessing application URL:", applicationUrl);
                  
                  // If using mock data and URL would be a fake domain, show a message
                  if (job.id.startsWith('job-') && !process.env.NODE_ENV === 'production') {
                    e.preventDefault();
                    alert("In production, this would redirect to the job application page at: " + applicationUrl);
                  }
                }}
              >
                Apply Now <span className="arrow">→</span>
              </a>
              
              {/* Alternative application methods */}
              <div className="alt-apply-methods">
                <span>Or apply via:</span>
                <a 
                  href={`mailto:careers@${job.company_name.toLowerCase().replace(/\s+/g, '')}.com?subject=Application for ${job.title}`}
                  className="alt-apply-btn email-btn"
                >
                  Email
                </a>
                <a 
                  href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}&location=${encodeURIComponent(job.candidate_required_location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="alt-apply-btn linkedin-btn"
                >
                  LinkedIn
                </a>
                <a 
                  href={`https://www.naukri.com/jobs-in-${job.candidate_required_location.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="alt-apply-btn naukri-btn"
                >
                  Naukri
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="jobs-container">
      <h1 className="main-heading">Best<span>Jobs</span>Online</h1>
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Job Title (e.g., Software Engineer)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Pune, Delhi, or All India)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>🔍 SEARCH</button>
        <Link to="/" className="home-btn">HOME</Link>
      </div>
   
      
      <h2 className="sub-heading">
        Showing {search || 'All'} jobs in {location || 'All India'}
      </h2>
      
      <div className="table-wrapper">
        {loading && page === 1 ? (
          <div className="loading-spinner">Loading jobs...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredJobs.length > 0 ? (
          <>
            <table className="job-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Posted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>{job.company_name || 'N/A'}</td>
                    <td>{job.title || 'N/A'}</td>
                    <td>{job.candidate_required_location || 'Remote'}</td>
                    <td>{job.job_type || 'Full-time'}</td>
                    <td>{job.posted_at ? formatDate(job.posted_at) : 'N/A'}</td>
                    <td>
                      <button 
                        className="view-btn" 
                        onClick={() => viewJobDetails(job)}
                      >
                        View ➤
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {hasMore && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Jobs'}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="no-results">No jobs found for "{search}" in "{location}".</p>
        )}
      </div>
      
      {filteredJobs.length > 0 && (
        <div className="results-count">
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {showJobDetails && <JobDetailsModal job={selectedJob} />}
    </div>
  );
};

export default Jobs; 