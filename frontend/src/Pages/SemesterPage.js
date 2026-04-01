import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSemesters } from '../services/api';

const SEM_ICONS = ['📘', '📗'];

const SemesterPage = () => {
  const navigate = useNavigate();
  const { yearId, yearName } = useParams();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSemesters(); }, [yearId]);

  const fetchSemesters = async () => {
    setLoading(true);
    try {
      const res = await getSemesters(yearId);
      setSemesters(res.data);
    } catch {
      toast.error('Failed to load semesters');
    } finally { setLoading(false); }
  };

  const decoded = decodeURIComponent(yearName);

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to="/hpage" className="hover:text-primary-600 transition-colors">Faculties</Link>
            <span>/</span>
            <span className="text-neutral-700">{decoded}</span>
          </div>
          <h1 className="page-title">{decoded} - Select Semester</h1>
          <p className="page-subtitle">Choose your semester to view modules.</p>
        </div>

        {loading ? (
          <div className="card text-center py-10 text-neutral-500">Loading semesters...</div>
        ) : semesters.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📚</div>
            <p className="text-neutral-500">No semesters configured for this year.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {semesters.map((sem, i) => (
              <div
                key={sem._id}
                className="card cursor-pointer hover:-translate-y-0.5"
                onClick={() => navigate(`/modules/${sem._id}/${encodeURIComponent(sem.name)}`)}
              >
                <div className="text-4xl mb-3">{SEM_ICONS[i % 2]}</div>
                <p className="text-lg font-gilroyBold text-neutral-800 mb-1">{sem.name}</p>
                <p className="text-sm text-neutral-400">Explore modules</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SemesterPage;
