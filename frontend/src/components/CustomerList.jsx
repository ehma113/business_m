// frontend/src/components/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api'; // Import our API client

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect runs once when the component is first loaded
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        // Make a GET request to the /customers/ endpoint
        const response = await apiClient.get('/customers/');
        setCustomers(response.data);
        setError(null);
      } catch (err) {
        setError('Oops! Failed to fetch customers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []); // The empty array [] means this effect runs only once

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Customer List</h2>
      {customers.length === 0 ? (
        <p>No customers found.</p>
      ) : (
        <ul>
          {customers.map(customer => (
            <li key={customer.id}>
              {customer.name} - {customer.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CustomerList;