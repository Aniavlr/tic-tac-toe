import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h2 className="not-found-title">404 - Page Not Found</h2>
        <p className="not-found-message">
          Sorry, the page you are looking for does not exist.
        </p>
        <div className="not-found-illustration">
          <div className="not-found-error-code">404</div>
          <div className="not-found-error-icon">🔍</div>
        </div>
        <p className="not-found-suggestion">
          The page might have been moved, deleted, or you may have entered an
          incorrect URL.
        </p>
        <Link to="/" className="not-found-home-button">
          Return to Homepage
        </Link>
        <div className="not-found-help-links">
          <Link to="/game" className="not-found-link">
            Play Game
          </Link>
          <Link to="/leaderboard" className="not-found-link">
            Leaderboard
          </Link>
          <Link to="/account" className="not-found-link">
            Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
