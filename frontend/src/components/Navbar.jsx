import PropTypes from 'prop-types';

const Navbar = ({ user, onLogout }) => (
  <header className="navbar">
    <div>
      <h1>MSME AI Business Manager</h1>
      <p className="navbar__subtitle">Smart assistant for small businesses</p>
    </div>
    <div className="navbar__user">
      <span>{user?.email}</span>
      <button type="button" className="btn btn--ghost" onClick={onLogout}>
        Logout
      </button>
    </div>
  </header>
);

Navbar.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string
  }),
  onLogout: PropTypes.func.isRequired
};

Navbar.defaultProps = {
  user: null
};

export default Navbar;
