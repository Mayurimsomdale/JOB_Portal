import { useState, useEffect } from 'react';

// Mobile-responsive Jobs component with fixed link warnings
export default function Jobs() {
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [search, setSearch] = useState('Software Engineer');
  const [location, setLocation] = useState('India');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Simplified generateExpandedFallbackJobs function
  const generateExpandedFallbackJobs = (searchTerm, locationTerm, currentPage) => {
    const indianCompanies = [
      { name: 'TCS', logo: 'https://via.placeholder.com/150?text=TCS', website: 'https://www.tcs.com' },
      { name: 'Infosys', logo: 'https://via.placeholder.com/150?text=Infosys', website: 'https://www.infosys.com' },
      { name: 'Wipro', logo: 'https://via.placeholder.com/150?text=Wipro', website: 'https://www.wipro.com' },
      { name: 'HCL Technologies', logo: 'https://via.placeholder.com/150?text=HCL', website: 'https://www.hcltech.com' },
      { name: 'Tech Mahindra', logo: 'https://via.placeholder.com/150?text=TechM', website: 'https://www.techmahindra.com' }
    ];
    
    const indianCities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];
    const jobTypes = ['Full-time', 'Contract', 'Part-time', 'Internship', 'Remote'];
    const salaryRanges = ['₹4-6 LPA', '₹6-8 LPA', '₹8-10 LPA', '₹10-12 LPA', '₹12-15 LPA'];
    
    const jobsPerPage = 15;
    const startIdx = (currentPage - 1) * jobsPerPage;
    const endIdx = startIdx + jobsPerPage;
    const totalPossibleJobs = 100;
    
    if (startIdx >= totalPossibleJobs) {
      return [];
    }
    
    const numJobsToGenerate = Math.min(jobsPerPage, totalPossibleJobs - startIdx);
    setHasMore(endIdx < totalPossibleJobs);
    
    return Array.from({ length: numJobsToGenerate }, (_, i) => {
      const index = startIdx + i;
      const company = indianCompanies[index % indianCompanies.length];
      const specificLocation = locationTerm && locationTerm.toLowerCase() !== 'india' 
        ? locationTerm 
        : indianCities[index % indianCities.length];
      
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30));
      
      let jobTitle = searchTerm || 'Software Developer';
      
      return {
        id: `job-${index}`,
        company_name: company.name,
        company_logo: company.logo,
        company_website: company.website,
        title: jobTitle,
        candidate_required_location: specificLocation,
        job_type: jobTypes[index % jobTypes.length],
        url: `${company.website}/careers/jobs/${index}`,
        apply_url: `${company.website}/careers/apply/${index}`,
        description: `<p>We are looking for a talented ${jobTitle} to join our team in ${specificLocation}.</p>
                      <p>Requirements: Bachelor's degree, 2+ years experience.</p>
                      <p>Benefits: Competitive salary, health insurance, flexible work options.</p>`,
        salary: salaryRanges[index % salaryRanges.length],
        posted_at: postedDate.toISOString()
      };
    });
  };

  // Fetch jobs when search terms change
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Simulating API call failure - using fallback data
        const fallbackData = generateExpandedFallbackJobs(search, location, page);
        
        if (page > 1) {
          setFilteredJobs(prev => [...prev, ...fallbackData]);
        } else {
          setFilteredJobs(fallbackData);
        }
      } catch (error) {
        setError("Error loading jobs. Please try again.");
      }
      
      setLoading(false);
    };
    
    fetchJobs();
  }, [search, location, page]);

  const handleSearch = () => {
    setPage(1);
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

  // Function to generate email application link
  const getEmailLink = (job) => {
    const companyDomain = job.company_website?.replace('https://www.', '').replace('http://www.', '') || 'example.com';
    return `mailto:careers@${companyDomain}?subject=Application for ${encodeURIComponent(job.title)}`;
  };

  // Function to generate LinkedIn search link
  const getLinkedInLink = (job) => {
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}&location=${encodeURIComponent(job.candidate_required_location)}`;
  };

  // Function to generate Naukri search link
  const getNaukriLink = (job) => {
    const locationParam = job.candidate_required_location.toLowerCase().replace(/\s+/g, '-');
    return `https://www.naukri.com/jobs-in-${locationParam}`;
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Best<span className="text-blue-600">Jobs</span>Online
      </h1>
      
      {/* Mobile-friendly search bar */}
      <div className="w-full flex flex-col sm:flex-row gap-2 mb-6">
        <input
          type="text"
          placeholder="Job Title (e.g., Software Engineer)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Location (e.g., Pune, Delhi)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button 
          onClick={handleSearch} 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          🔍 Search
        </button>
      </div>
      
      <h2 className="text-xl mb-4">
        Showing {search || 'All'} jobs in {location || 'All India'}
      </h2>
      
      {loading && page === 1 ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : filteredJobs.length > 0 ? (
        <>
          {/* Card view for mobile, list view for larger screens */}
          <div className="w-full">
            <div className="hidden md:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Company</th>
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Location</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Posted</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">{job.company_name || 'N/A'}</td>
                      <td className="p-2">{job.title || 'N/A'}</td>
                      <td className="p-2">{job.candidate_required_location || 'Remote'}</td>
                      <td className="p-2">{job.job_type || 'Full-time'}</td>
                      <td className="p-2">{job.posted_at ? formatDate(job.posted_at) : 'N/A'}</td>
                      <td className="p-2">
                        <button 
                          onClick={() => viewJobDetails(job)}
                          className="bg-blue-600 text-white py-1 px-3 rounded text-sm hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile card view */}
            <div className="md:hidden space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{job.title}</h3>
                      <p className="text-gray-600">{job.company_name}</p>
                    </div>
                    {job.company_logo && (
                      <img 
                        src={job.company_logo} 
                        alt={job.company_name} 
                        className="w-10 h-10 object-contain"
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-1 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Location:</span> {job.candidate_required_location}
                    </div>
                    <div>
                      <span className="text-gray-500">Type:</span> {job.job_type}
                    </div>
                    <div>
                      <span className="text-gray-500">Salary:</span> {job.salary || 'Not specified'}
                    </div>
                    <div>
                      <span className="text-gray-500">Posted:</span> {formatDate(job.posted_at)}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => viewJobDetails(job)}
                    className="w-full bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {hasMore && (
            <div className="w-full flex justify-center mt-6">
              <button 
                onClick={loadMore}
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 disabled:bg-blue-400"
              >
                {loading ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center p-8">No jobs found for "{search}" in "{location}".</p>
      )}
      
      {filteredJobs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Found {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
        </div>
      )}
      
      {/* Mobile-responsive Job Details Modal */}
      {showJobDetails && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{selectedJob.title}</h2>
              <button 
                onClick={closeJobDetails}
                className="text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                {selectedJob.company_logo && (
                  <img 
                    src={selectedJob.company_logo} 
                    alt={`${selectedJob.company_name} logo`} 
                    className="w-16 h-16 object-contain"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{selectedJob.company_name}</h3>
                  <p className="text-gray-600">{selectedJob.candidate_required_location}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div><span className="font-semibold">Job Type:</span> {selectedJob.job_type}</div>
                {selectedJob.salary && (
                  <div><span className="font-semibold">Salary:</span> {selectedJob.salary}</div>
                )}
                {selectedJob.posted_at && (
                  <div><span className="font-semibold">Posted:</span> {formatDate(selectedJob.posted_at)}</div>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Job Description</h3>
                <div dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
              </div>
              
              <div className="border-t pt-4 mt-4">
                <a 
                  href={selectedJob.apply_url || selectedJob.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded font-medium hover:bg-blue-700"
                >
                  Apply Now
                </a>
                
                <div className="flex justify-center gap-4 mt-4">
                  <a 
                    href={getEmailLink(selectedJob)} 
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Email
                  </a>
                  <a 
                    href={getLinkedInLink(selectedJob)} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    LinkedIn
                  </a>
                  <a 
                    href={getNaukriLink(selectedJob)} 
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Naukri
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}