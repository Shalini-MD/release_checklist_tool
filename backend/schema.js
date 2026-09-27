const { pool } = require('./db');

const typeDefs = `#graphql
  type Release {
    id: ID!
    name: String!
    date: String!
    additional_info: String
    completed_steps: [Int!]!
    status: String!
  }

  type Query {
    releases: [Release!]!
    release(id: ID!): Release
  }

  type Mutation {
    createRelease(name: String!, date: String!, additional_info: String): Release!
    updateRelease(id: ID!, name: String, date: String, additional_info: String): Release!
    toggleStep(id: ID!, step: Int!): Release!
    deleteRelease(id: ID!): Boolean!
  }
`;

const calculateStatus = (completed_steps) => {
  const steps = completed_steps || [];
  if (steps.length === 0) return 'PLANNED';
  if (steps.length === 7) return 'DONE';
  return 'ONGOING';
};

const formatRelease = (row) => {
  let completed = [];
  if (typeof row.completed_steps === 'string') {
    completed = JSON.parse(row.completed_steps);
  } else if (Array.isArray(row.completed_steps)) {
    completed = row.completed_steps;
  }
  
  return {
    id: row.id,
    name: row.name,
    date: new Date(row.date).toISOString(),
    additional_info: row.additional_info,
    completed_steps: completed,
    status: calculateStatus(completed)
  };
};

const resolvers = {
  Query: {
    releases: async () => {
      const [rows] = await pool.query('SELECT * FROM releases ORDER BY date ASC');
      return rows.map(formatRelease);
    },
    release: async (_, { id }) => {
      const [rows] = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
      if (rows.length === 0) throw new Error('Release not found');
      return formatRelease(rows[0]);
    }
  },
  Mutation: {
    createRelease: async (_, { name, date, additional_info }) => {
      const [result] = await pool.query(
        'INSERT INTO releases (name, date, additional_info, completed_steps) VALUES (?, ?, ?, ?)',
        [name, new Date(date), additional_info || '', JSON.stringify([])]
      );
      const [rows] = await pool.query('SELECT * FROM releases WHERE id = ?', [result.insertId]);
      return formatRelease(rows[0]);
    },
    updateRelease: async (_, { id, name, date, additional_info }) => {
      const [current] = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
      if (current.length === 0) throw new Error('Release not found');
      
      const updatedName = name !== undefined ? name : current[0].name;
      const updatedDate = date !== undefined ? new Date(date) : current[0].date;
      const updatedInfo = additional_info !== undefined ? additional_info : current[0].additional_info;
      
      await pool.query(
        'UPDATE releases SET name = ?, date = ?, additional_info = ? WHERE id = ?',
        [updatedName, updatedDate, updatedInfo, id]
      );
      const [rows] = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
      return formatRelease(rows[0]);
    },
    toggleStep: async (_, { id, step }) => {
      const [rows] = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
      if (rows.length === 0) throw new Error('Release not found');
      
      let completed = [];
      if (typeof rows[0].completed_steps === 'string') {
        completed = JSON.parse(rows[0].completed_steps);
      } else if (Array.isArray(rows[0].completed_steps)) {
        completed = rows[0].completed_steps;
      }
      
      if (completed.includes(step)) {
        completed = completed.filter(s => s !== step);
      } else {
        completed.push(step);
      }
      
      await pool.query('UPDATE releases SET completed_steps = ? WHERE id = ?', [JSON.stringify(completed), id]);
      
      const [updated] = await pool.query('SELECT * FROM releases WHERE id = ?', [id]);
      return formatRelease(updated[0]);
    },
    deleteRelease: async (_, { id }) => {
      const [result] = await pool.query('DELETE FROM releases WHERE id = ?', [id]);
      return result.affectedRows > 0;
    }
  }
};

module.exports = { typeDefs, resolvers, calculateStatus };
