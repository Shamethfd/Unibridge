import { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchFilter.css';

const SearchFilter = () => {
  const [activeTab, setActiveTab] = useState('modules');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterAudience, setFilterAudience] = useState('all');

  useEffect(() => {
    const delaySearch = setTimeout(async () => {
      if (!searchQuery.trim() && filterAudience === 'all') {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/notices', {
          params: {
            search: searchQuery,
            target: filterAudience !== 'all' ? filterAudience : '',
          },
        });
        setResults(res.data);
      } catch (err) {
        console.error('Search error:', err);
      }
      setLoading(false);
    }, 400);
    return () => clearTimeout(delaySearch);
  }, [searchQuery, activeTab, filterAudience]);

  const tabs = [
    { id: 'modules', label: '📚 Modules', placeholder: 'Search modules...' },
    { id: 'sessions', label: '📅 Sessions', placeholder: 'Search sessions...' },
    { id: 'tutors',   label: '👨‍🏫 Tutors',   placeholder: 'Filter tutors...' },
  ];

  return (
    <div className="search-filter-container">
      <div className="search-header">
        <h3>🔍 Search & Filter</h3>
        <p>Search modules, sessions and filter tutors</p>
      </div>

      {/* Tabs */}
      <div className="search-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); setResults([]); setSearchQuery(''); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="search-bar-row">
        <div className="search-input-wrapper">
          <span className="s-icon">🔍</span>
          <input
            type="text"
            placeholder={tabs.find(t => t.id === activeTab)?.placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-main-input"
          />
          {searchQuery && (
            <button className="clear-btn" onClick={() => { setSearchQuery(''); setResults([]); }}>✕</button>
          )}
        </div>

        <select
          className="audience-filter"
          value={filterAudience}
          onChange={e => setFilterAudience(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="students">🎓 Students</option>
          <option value="tutors">👨‍🏫 Tutors</option>
        </select>
      </div>

      {/* Results */}
      <div className="search-results">
        {loading && (
          <div className="search-loading">⏳ Searching...</div>
        )}

        {!loading && (searchQuery || filterAudience !== 'all') && results.length === 0 && (
          <div className="no-results">
            <p>😔 No results found</p>
            <small>Try a different search term or filter</small>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <div className="results-header">
              <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            </div>
            {results.map((item) => (
              <div key={item._id} className="result-card">
                <div className="result-card-top">
                  <h4>{item.title}</h4>
                  <span className={`result-badge ${item.targetAudience}`}>
                    {item.targetAudience === 'all' ? '🌐 All' :
                     item.targetAudience === 'students' ? '🎓 Students' : '👨‍🏫 Tutors'}
                  </span>
                </div>
                <p>{item.content?.length > 120 ? item.content.substring(0, 120) + '...' : item.content}</p>
                {item.module && <span className="result-module">📚 {item.module}</span>}
                <div className="result-footer">
                  <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                  <span>👁 {item.viewedBy?.length || 0} views</span>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && !searchQuery && filterAudience === 'all' && (
          <div className="search-placeholder">
            <p>🔍 Start typing to search...</p>
            <small>Search across modules, sessions and tutors</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;