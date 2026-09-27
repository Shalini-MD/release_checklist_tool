import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useNavigate, Link } from 'react-router-dom';

const CREATE_RELEASE = gql`
  mutation CreateRelease($name: String!, $date: String!, $additional_info: String) {
    createRelease(name: $name, date: $date, additional_info: $additional_info) {
      id
    }
  }
`;
const GET_RELEASES = gql`
  query GetReleases {
    releases {
      id
      name
      date
      status
    }
  }
`;

export default function CreateRelease() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [createRelease, { loading }] = useMutation(CREATE_RELEASE, {
    refetchQueries: [{ query: GET_RELEASES }]
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createRelease({
      variables: { name, date, additional_info: additionalInfo }
    });
    navigate('/');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Create New Release</h1>
        <Link to="/" className="btn btn-outline">Back to Releases</Link>
      </div>

      <div className="card" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Release Name *</label>
            <input 
              type="text" 
              className="form-control" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Version 1.0.0"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Due Date *</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Additional Information</label>
            <textarea 
              className="form-control" 
              rows="4"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            ></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Release'}
          </button>
        </form>
      </div>
    </div>
  );
}
