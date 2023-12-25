import React, { useEffect, useState } from "react";

const RegisteredUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Make an API request to fetch the registered users
    // Replace "apiEndpoint" with your actual API endpoint
    fetch("apiEndpoint")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <h2>Registered Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default RegisteredUsers;