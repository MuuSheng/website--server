import React, { useState } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import TaskManager from './components/TaskManager';
import FileUpload from './components/FileUpload';
import Chat from './components/Chat';

function App() {
  const [currentView, setCurrentView] = useState('register');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="App">
        <h1>My Website</h1>
        {currentView === 'register' ? (
          <div>
            <Register />
            <p>
              Already have an account?{' '}
              <button onClick={() => setCurrentView('login')}>Login</button>
            </p>
          </div>
        ) : (
          <div>
            <Login onLogin={handleLogin} />
            <p>
              Don't have an account?{' '}
              <button onClick={() => setCurrentView('register')}>Register</button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <h1>My Website</h1>
      <button onClick={handleLogout}>Logout</button>
      <TaskManager />
      <FileUpload />
      <Chat />
    </div>
  );
}

export default App;