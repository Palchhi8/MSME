import PropTypes from 'prop-types';
import Dashboard from '../components/Dashboard';
import SalesUpload from '../components/SalesUpload';
import AIChat from '../components/AIChat';
import Navbar from '../components/Navbar';

const Home = ({ user, onLogout }) => (
  <div className="app-shell">
    <Navbar user={user} onLogout={onLogout} />
    <main className="content">
      <Dashboard />
      <div className="grid-two-columns">
        <SalesUpload />
        <AIChat />
      </div>
    </main>
  </div>
);

Home.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

Home.defaultProps = {
  user: null
};

export default Home;
