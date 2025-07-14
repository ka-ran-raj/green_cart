import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const user = React.useMemo(() => {
    return JSON.parse(localStorage.getItem('user')) || {};
  }, []);

  const isAdmin = user.isAdmin === true;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        if (!user || !user.username) {
          setError('Please Login to View Orders');
          setLoading(false);
          return;
        }

        const endpoint = isAdmin
          ? 'http://localhost:5000/api/orders'
          : `http://localhost:5000/api/orders/user/${user.username}`;

        const response = await axios.get(endpoint);
        const sortedOrders = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError('Failed to fetch orders: ' + err.message);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []); // ✅ Runs only once

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/update-status/${orderId}`, {
        status: newStatus,
      });

      const updated = orders.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );

      setOrders(updated);
      setFilteredOrders(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("❌ Failed to update status");
    }
  };

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = orders.filter(order =>
      (order.username && order.username.toLowerCase().includes(lowerSearch)) ||
      (order.plantName && order.plantName.toLowerCase().includes(lowerSearch)) ||
      (order.address && order.address.toLowerCase().includes(lowerSearch))
    );
    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  return (
    <div className="order-container">
      <h2>{isAdmin ? 'All Orders' : 'My Orders'}</h2>

      <input
        type="text"
        placeholder="Search by Username, Plant or Address"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {filteredOrders.length > 0 ? (
        <table className="order-table">
          <thead>
            <tr>
              <th>Order ID</th>
              {isAdmin && <th>Username</th>}
              <th>Address</th>
              <th>Plant</th>
              <th>Quantity</th>
              <th>Total (₹)</th>
              <th>Date</th>
              <th>Payment ID</th>
              <th>Status</th>
              {isAdmin && <th>Update Status</th>}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order._id}>
                <td>ORD-{String(order.orderId).padStart(3, '0')}</td>
                {isAdmin && <td>{order.username}</td>}
                <td>{order.address}</td>
                <td>{order.plantName}</td>
                <td>{order.quantity}</td>
                <td>{order.totalAmount}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.paymentId || 'N/A'}</td>
                <td>{order.status || 'Pending'}</td>
                {isAdmin && (
                  <td>
                    <select
                      value={order.status || 'Pending'}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipping Out">Shipping Out</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Confirmed">Confirmed</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : loading ? (
        <p>Loading Orders...</p>
      ) : (
        <p>No Orders Found</p>
      )}
    </div>
  );
}

export default MyOrders;
