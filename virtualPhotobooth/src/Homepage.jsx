import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Homepage.css'; // Import CSS for styling
import logo2 from './assets/logo2.png'; // Import Logo 2
import logo1 from './assets/logo1.png'; // Import Logo 1

const HomePage = () => {
    const navigate = useNavigate();

    const handleNavigateToAgreement = () => {
        navigate('/agreement'); // Redirect to the agreement page
    };

    return (
        <div className="home-container">
            
            <button className="start-button" onClick={handleNavigateToAgreement}>Tap to Start</button>
        </div>
    );
};

export default HomePage;
