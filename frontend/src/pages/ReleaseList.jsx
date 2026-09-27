import React from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

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

const DELETE_RELEASE = gql`
  mutation DeleteRelease($id: ID!) {
    deleteRelease(id: $id)
  }
`;

export default function ReleaseList() {
  const { loading, error, data, refetch } = useQuery(GET_RELEASES);
  const [deleteRelease] = useMutation(DELETE_RELEASE);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this release?')) {
      await deleteRelease({ variables: { id } });
      refetch();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Release Checklist</h1>
        <Link to="/create" className="btn btn-primary">+ New Release</Link>
      </div>
      
      <div className="card">
        <div className="table-responsive">
          <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.releases.map((release) => (
              <tr key={release.id}>
                <td>{release.name}</td>
                <td>{format(new Date(release.date), 'MMM dd, yyyy')}</td>
                <td>
                  <span className={`status-badge status-${release.status}`}>
                    {release.status}
                  </span>
                </td>
                <td>
                  <Link to={`/release/${release.id}`} className="btn btn-outline" style={{ marginRight: '8px' }}>View</Link>
                  <button onClick={() => handleDelete(release.id)} className="btn btn-danger">Delete</button>
                </td>
              </tr>
            ))}
            {data.releases.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center' }}>No releases found.</td>
              </tr>
            )}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
