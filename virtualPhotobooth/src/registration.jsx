import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Registration = ({ setUserInfo }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [department, setDepartment] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await axios.post('https://main2-2.onrender.com/api/register', {
                name,
                email,
                department,
            }, {
                withCredentials: true // Include credentials for session
            });

            if (response.status === 200) {
                setUserInfo({ name, email, department });
                navigate('/capture-image');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMessage('Registration failed. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields here */}
        </form>
    );
};

export default Registration;
