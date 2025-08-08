import React, { useState, useEffect, createContext, useContext } from 'react';
import { Search, Plus, User, LogOut, Vote, BarChart3, Clock, Users, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const profileData = await response.json();
        setUser(profileData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.removeItem('token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.tokens.access);
      setToken(data.tokens.access);
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  };

  const register = async (userData) => {
    const response = await fetch('http://localhost:8000/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.tokens.access);
      setToken(data.tokens.access);
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, errors: data };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Service
class ApiService {
  constructor(token) {
    this.token = token;
    this.baseURL = 'http://localhost:8000/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || 'Something went wrong');
    }

    return response.json();
  }

  // Poll methods
  async getPolls(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/polls/${queryString ? `?${queryString}` : ''}`);
  }

  async getPoll(id) {
    return this.request(`/polls/${id}/`);
  }

  async createPoll(pollData) {
    return this.request('/polls/', {
      method: 'POST',
      body: JSON.stringify(pollData),
    });
  }

  async vote(pollId, optionId) {
    return this.request(`/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    });
  }

  async getPollResults(pollId) {
    return this.request(`/polls/${pollId}/results/`);
  }

  async getMyPolls() {
    return this.request('/polls/my_polls/');
  }

  async getMyVotes() {
    return this.request('/polls/my_votes/');
  }
}

// Components
const LoginForm = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline"
        >
          Register here
        </button>
      </p>
    </div>
  );
};

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await register(formData);
    
    if (!result.success) {
      setErrors(result.errors);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Register</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.username && (
            <p className="text-red-600 text-sm mt-1">{errors.username[0]}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email[0]}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPasswords ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password[0]}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password *
          </label>
          <input
            type={showPasswords ? 'text' : 'password'}
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          {errors.non_field_errors && (
            <p className="text-red-600 text-sm mt-1">{errors.non_field_errors[0]}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-600">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-blue-600 hover:underline"
        >
          Login here
        </button>
      </p>
    </div>
  );
};

const Header = ({ onCreatePoll, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">PollSystem</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Polls
              </button>
              <button
                onClick={() => setActiveTab('my-polls')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'my-polls' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Polls
              </button>
              <button
                onClick={() => setActiveTab('my-votes')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'my-votes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Votes
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onCreatePoll}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Poll</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User size={20} className="text-gray-600" />
                <span className="text-gray-700">{user?.username}</span>
              </div>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const CreatePollModal = ({ isOpen, onClose, onPollCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expires_at: '',
    allow_multiple_votes: false,
    options: ['', ''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions,
    });
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        options: newOptions,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const api = new ApiService(token);
      const filteredOptions = formData.options.filter(option => option.trim() !== '');
      
      if (filteredOptions.length < 2) {
        setError('At least 2 options are required.');
        setLoading(false);
        return;
      }

      const pollData = {
        ...formData,
        options: filteredOptions,
        expires_at: formData.expires_at || null,
      };

      await api.createPoll(pollData);
      onPollCreated();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        expires_at: '',
        allow_multiple_votes: false,
        options: ['', ''],
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Create New Poll</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <input
              type="datetime-local"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allow_multiple_votes"
              checked={formData.allow_multiple_votes}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Allow multiple votes per user
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Options *
            </label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="text-red-600 hover:text-red-800 px-2"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            {formData.options.length < 10 && (
              <button
                type="button"
                onClick={addOption}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
              >
                <Plus size={16} />
                <span>Add Option</span>
              </button>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PollCard = ({ poll, onVote, showResults = false }) => {
  const [voting, setVoting] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const { user, token } = useAuth();

  const handleVote = async (optionId) => {
    if (voting) return;
    
    setVoting(true);
    try {
      const api = new ApiService(token);
      await api.vote(poll.id, optionId);
      onVote();
    } catch (error) {
      alert(error.message);
    } finally {
      setVoting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasUserVoted = poll.user_votes && poll.user_votes.length > 0;
  const canVote = user && poll.is_active && !poll.is_expired && (!hasUserVoted || poll.allow_multiple_votes);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">{poll.title}</h3>
          {poll.description && (
            <p className="text-gray-600 mb-3">{poll.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1">
              <User size={16} />
              <span>{poll.created_by.username}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock size={16} />
              <span>{formatDate(poll.created_at)}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Users size={16} />
              <span>{poll.total_votes} votes</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {poll.is_expired && (
            <span className="flex items-center space-x-1 text-red-600 text-sm">
              <XCircle size={16} />
              <span>Expired</span>
            </span>
          )}
          {!poll.is_active && (
            <span className="flex items-center space-x-1 text-gray-600 text-sm">
              <XCircle size={16} />
              <span>Inactive</span>
            </span>
          )}
          {poll.is_active && !poll.is_expired && (
            <span className="flex items-center space-x-1 text-green-600 text-sm">
              <CheckCircle size={16} />
              <span>Active</span>
            </span>
          )}
        </div>
      </div>
      
      {poll.expires_at && (
        <div className="mb-4 text-sm text-gray-600">
          <span className="font-medium">Expires:</span> {formatDate(poll.expires_at)}
        </div>
      )}
      
      <div className="space-y-3">
        {poll.options && poll.options.map((option) => {
          const isUserVote = poll.user_votes && poll.user_votes.includes(option.id);
          const percentage = option.vote_percentage || 0;
          
          return (
            <div key={option.id} className="relative">
              {showResults || hasUserVoted ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-medium ${isUserVote ? 'text-blue-600' : 'text-gray-800'}`}>
                      {option.text}
                      {isUserVote && <span className="ml-2 text-sm">✓ Your vote</span>}
                    </span>
                    <span className="text-sm text-gray-600">
                      {option.vote_count} votes ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isUserVote ? 'bg-blue-600' : 'bg-green-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleVote(option.id)}
                  disabled={!canVote || voting}
                  className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                    canVote && !voting
                      ? 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                >
                  <span className="font-medium text-gray-800">{option.text}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      
      {!user && (
        <div className="mt-4 text-center text-gray-600 text-sm">
          Please log in to vote
        </div>
      )}
      
      {hasUserVoted && !showResults && (
        <div className="mt-4 text-center text-green-600 text-sm font-medium">
          ✓ You have voted in this poll
        </div>
      )}
    </div>
  );
};

const PollList = ({ polls, loading, onVote, showResults = false }) => {
  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No polls found</h3>
        <p className="text-gray-600">Be the first to create a poll!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          poll={poll}
          onVote={onVote}
          showResults={showResults}
        />
      ))}
    </div>
  );
};

const SearchAndFilter = ({ onSearch, onFilter, searchTerm, filters }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search polls..."
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filters.status}
            onChange={(e) => onFilter({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="active">Active Only</option>
            <option value="all">All Polls</option>
            <option value="expired">Expired Only</option>
          </select>
          
          <select
            value={filters.sort}
            onChange={(e) => onFilter({ ...filters, sort: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: 'active', sort: '-created_at' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { token } = useAuth();

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const api = new ApiService(token);
      let pollsData;
      
      const params = {
        search: searchTerm,
        ordering: filters.sort,
      };
      
      if (filters.status === 'all') {
        params.show_all = 'true';
      }
      
      switch (activeTab) {
        case 'my-polls':
          pollsData = await api.getMyPolls();
          break;
        case 'my-votes':
          pollsData = await api.getMyVotes();
          break;
        default:
          pollsData = await api.getPolls(params);
          break;
      }
      
      setPolls(Array.isArray(pollsData) ? pollsData : pollsData.results || []);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [activeTab, searchTerm, filters, token]);

  const handleVote = () => {
    fetchPolls();
  };

  const handlePollCreated = () => {
    fetchPolls();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onCreatePoll={() => setShowCreateModal(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <SearchAndFilter
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchTerm={searchTerm}
          filters={filters}
        />
        
        <PollList
          polls={polls}
          loading={loading}
          onVote={handleVote}
          showResults={activeTab === 'my-votes'}
        />
      </main>
      
      <CreatePollModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPollCreated={handlePollCreated}
      />
    </div>
  );
};

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">PollSystem</h1>
          <p className="text-gray-600">Create and participate in polls</p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <Dashboard /> : <AuthPage />;
};

export default function PollSystem() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
