import React, { useState } from 'react';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:3000/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user:{
              username: username,
              password: password,
            }
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data["error"]) {
              alert(data["error"]);
              return;
            }
            alert("Login successful");
            localStorage.setItem('userId', data["id"]);
            window.location.href = '/devices';
          })
          .catch((error) => {
            console.error('Error:', error);
            // Handle login error, e.g., show error message to the user
          });
      };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Username:
                <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                />
            </label>
            <label>
                Password:
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                />
            </label>
            <button type="submit">Log in</button>
        </form>
    );
}

export default UserLogin;