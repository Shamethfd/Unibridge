import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StructuredResources = () => {
  const [academicStructure, setAcademicStructure] = useState({});
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedSemesters, setExpandedSemesters] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleResources, setModuleResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({ year: '', semester: '' });

  useEffect(() => {
    fetchAcademicStructure();
  }, []);

  const fetchAcademicStructure = async () => {
    try {
      // Fetch all modules to build the structure
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/modules`
      );

      console.log('Modules API Response:', response.data); // Debug log

      if (response.data.success) {
        const modules = response.data.data.modules || [];
        console.log('Modules:', modules); // Debug log
        
        // Build academic structure from modules
        const structure = {};
        modules.forEach(module => {
          const year = module.year.toString();
          const semester = module.semester.toString();
          const moduleName = module.name;
          
          if (!structure[year]) {
            structure[year] = {};
          }
          if (!structure[year][semester]) {
            structure[year][semester] = new Set();
          }
          structure[year][semester].add(moduleName);
        });
        
        // Convert Sets to Arrays
        Object.keys(structure).forEach(year => {
          Object.keys(structure[year]).forEach(semester => {
            structure[year][semester] = Array.from(structure[year][semester]).sort();
          });
        });
        
        console.log('Built structure:', structure); // Debug log
        setAcademicStructure(structure);
      } else {
        console.error('API returned success=false:', response.data);
        toast.error('Failed to fetch modules: ' + (response.data.message || 'Unknown error'));
        // Set empty structure on failure
        setAcademicStructure({});
      }
    } catch (error) {
      console.error('Error fetching structure:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to fetch academic structure: ' + (error.response?.data?.message || error.message));
      // Set empty structure on error
      setAcademicStructure({});
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleResources = async (module, year, semester) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/management/module/${encodeURIComponent(module)}?year=${year}&semester=${semester}`
      );

      if (response.data.success) {
        setModuleResources(response.data.data.resources);
        setCurrentFilters({ year, semester });
      }
    } catch (error) {
      toast.error('Failed to fetch module resources');
      console.error('Error fetching module resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleYear = (year) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  const toggleSemester = (year, semester) => {
    const key = `${year}-${semester}`;
    const newExpanded = new Set(expandedSemesters);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSemesters(newExpanded);
  };

  const toggleModule = (module) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(module)) {
      newExpanded.delete(module);
      setSelectedModule(null);
      setModuleResources([]);
    } else {
      newExpanded.add(module);
      setSelectedModule(module);
    }
    setExpandedModules(newExpanded);
  };

  const handleDownload = async (resource) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/resources/${resource._id}/download`,
        {
          responseType: 'blob'
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download resource');
      console.error('Error downloading resource:', error);
    }
  };

  const getYearLabel = (year) => {
    const labels = {
      '1': '1st Year',
      '2': '2nd Year',
      '3': '3rd Year',
      '4': '4th Year'
    };
    return labels[year] || `${year} Year`;
  };

  const getSemesterLabel = (semester) => {
    const labels = {
      '1': '1st Semester',
      '2': '2nd Semester'
    };
    return labels[semester] || `${semester} Semester`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ToastContainer position="top-right" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading academic resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">LearnBridge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/submit-resource"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Submit Resource
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Breadcrumb */}
          {selectedModule && (
            <div className="mb-6 flex items-center text-sm text-gray-600">
              <Link to="/resources" className="hover:text-indigo-600">
                Resources
              </Link>
              <span className="mx-2">→</span>
              <span>{getYearLabel(currentFilters.year)}</span>
              <span className="mx-2">→</span>
              <span>{getSemesterLabel(currentFilters.semester)}</span>
              <span className="mx-2">→</span>
              <span className="text-indigo-600 font-medium">{selectedModule}</span>
            </div>
          )}

          {selectedModule ? (
            /* Module Resources View */
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedModule} Resources
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {moduleResources.length} resource{moduleResources.length !== 1 ? 's' : ''}
                </p>
              </div>

              {moduleResources.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No resources found for this module.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {moduleResources.map((resource) => (
                    <div key={resource._id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">
                            {resource.title}
                          </h4>
                          <p className="text-gray-600 text-sm mb-3">
                            {resource.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By: {resource.uploadedBy?.profile?.firstName} {resource.uploadedBy?.profile?.lastName}</span>
                            <span>•</span>
                            <span>{formatFileSize(resource.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleDownload(resource)}
                            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Academic Structure View */
            Object.keys(academicStructure).length === 0 ? (
              <div className="bg-white shadow rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
                <p className="text-gray-600 mb-4">
                  There are no approved resources yet. Submit your first resource to get started!
                </p>
                <Link
                  to="/submit-resource"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Submit Resource
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Resources</h2>
                
                {Object.keys(academicStructure)
                  .sort((a, b) => parseInt(a) - parseInt(b))
                  .map((year) => (
                    <div key={year} className="bg-white shadow rounded-lg">
                      <div
                        className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleYear(year)}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">
                            {getYearLabel(year)}
                          </h3>
                          <svg
                            className={`w-5 h-5 text-gray-400 transform transition-transform ${
                              expandedYears.has(year) ? 'rotate-90' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {expandedYears.has(year) && (
                        <div className="px-6 py-4 space-y-3">
                          {[1, 2].map((semester) => {
                            const semesterKey = `${year}-${semester}`;
                            const semesterModules = academicStructure[year]?.[semester] || [];
                            
                            return (
                              <div key={semesterKey} className="border-l-4 border-gray-200">
                                <div
                                  className="pl-4 py-3 cursor-pointer hover:bg-gray-50"
                                  onClick={() => toggleSemester(year, semester)}
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-md font-medium text-gray-800">
                                      {getSemesterLabel(semester)}
                                    </h4>
                                    <svg
                                      className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                        expandedSemesters.has(semesterKey) ? 'rotate-90' : ''
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>

                                {expandedSemesters.has(semesterKey) && (
                                  <div className="pl-4 py-3 space-y-2">
                                    {semesterModules.map((module) => (
                                      <div
                                        key={module}
                                        className="p-3 border-l-2 border-gray-300 cursor-pointer hover:bg-indigo-50"
                                        onClick={() => toggleModule(module)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-medium text-indigo-600">
                                            {module}
                                          </span>
                                          <svg
                                            className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                              expandedModules.has(module) ? 'rotate-90' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StructuredResources;
