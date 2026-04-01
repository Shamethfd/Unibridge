import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getYears } from '../services/api';

const YearPage = () => {
  const navigate = useNavigate();
  const { facultyId, facultyName } = useParams();
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchYears(); }, [facultyId]);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await getYears(facultyId);
      setYears(res.data);
    } catch {
      toast.error('Failed to load years');
    } finally { setLoading(false); }
  };

  const decodedFaculty = decodeURIComponent(facultyName);

  return (
    <div className="page-container animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link to="/dashboard" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link to="/hpage" className="hover:text-primary-600 transition-colors">Faculties</Link>
            <span>/</span>
            <span className="text-neutral-700">{decodedFaculty}</span>
          </div>
          <h1 className="page-title">{decodedFaculty} - Select Year</h1>
          <p className="page-subtitle">Choose your academic year to continue.</p>
        </div>

        {loading ? (
          <div className="card text-center py-10 text-neutral-500">Loading years...</div>
        ) : years.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-neutral-500">No years configured yet. Please add years from admin side.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {years.map((year, i) => (
              <div
                key={year._id}
                className="card cursor-pointer hover:-translate-y-0.5"
                onClick={() => navigate(`/semesters/${year._id}/${encodeURIComponent(year.name)}`)}
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 font-gilroyBold flex items-center justify-center mb-3">
                  {i + 1}
                </div>
                <p className="font-gilroyBold text-neutral-800 mb-1">{year.name}</p>
                <p className="text-sm text-neutral-400">Open semesters</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YearPage;
