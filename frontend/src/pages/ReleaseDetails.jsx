import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';

const GET_RELEASE = gql`
  query GetRelease($id: ID!) {
    release(id: $id) {
      id
      name
      date
      additional_info
      completed_steps
      status
    }
  }
`;

const TOGGLE_STEP = gql`
  mutation ToggleStep($id: ID!, $step: Int!) {
    toggleStep(id: $id, step: $step) {
      id
      completed_steps
      status
    }
  }
`;

const UPDATE_RELEASE = gql`
  mutation UpdateRelease($id: ID!, $additional_info: String) {
    updateRelease(id: $id, additional_info: $additional_info) {
      id
      additional_info
    }
  }
`;

const STEPS = [
  'Code merged',
  'Tests passing',
  'Documentation updated',
  'Staging deployment',
  'QA completed',
  'Production deployment',
  'Release announced'
];

export default function ReleaseDetails() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_RELEASE, { variables: { id } });
  const [toggleStep] = useMutation(TOGGLE_STEP);
  const [updateRelease] = useMutation(UPDATE_RELEASE);
  
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [savingInfo, setSavingInfo] = useState(false);

  useEffect(() => {
    if (data?.release) {
      setAdditionalInfo(data.release.additional_info || '');
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const release = data.release;

  const handleToggle = async (stepIndex) => {
    await toggleStep({ variables: { id, step: stepIndex } });
  };

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    await updateRelease({ variables: { id, additional_info: additionalInfo } });
    setSavingInfo(false);
  };

  const completedCount = release.completed_steps.length;
  const totalCount = STEPS.length;

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/" className="btn btn-outline">← Back to Releases</Link>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.75rem' }}>{release.name}</h1>
            <p style={{ margin: '0', color: 'var(--text-secondary)' }}>
              Due: {format(new Date(release.date), 'MMMM dd, yyyy h:mm a')}
            </p>
          </div>
          <div>
            <span className={`status-badge status-${release.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {release.status}
            </span>
            <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {completedCount} / {totalCount} completed
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Release Checklist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {STEPS.map((step, index) => {
              const isCompleted = release.completed_steps.includes(index);
              return (
                <label key={index} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => handleToggle(index)}
                    style={{ marginRight: '1rem', width: '1.25rem', height: '1.25rem' }}
                  />
                  <span style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                    {step}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Additional Information</h2>
          <textarea
            className="form-control"
            rows="10"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
          />
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '1rem' }} 
            onClick={handleSaveInfo}
            disabled={savingInfo}
          >
            {savingInfo ? 'Saving...' : 'Save Information'}
          </button>
        </div>
      </div>
    </div>
  );
}
