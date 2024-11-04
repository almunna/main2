import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';

const CaptureImage = ({ userInfo }) => {
    const [overlayedImage, setOverlayedImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setOverlayedImage(imageSrc);
    };

    const handleUpload = async () => {
        if (!overlayedImage) {
            setErrorMessage('Please capture an image before uploading.');
            return;
        }

        const response = await fetch(overlayedImage);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image', blob, 'captured_image.png');

        try {
            const res = await axios.post('https://main2-2.onrender.com/api/upload', formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (res.status === 200) {
                setSuccessMessage('Image uploaded successfully!');
                setTimeout(() => navigate('/register'), 2000);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setErrorMessage('Failed to upload image. Please try again.');
        }
    };

    return (
        <div>
            <Webcam ref={webcamRef} screenshotFormat="image/png" />
            <button onClick={captureImage}>Capture</button>
            <button onClick={handleUpload}>Upload</button>
        </div>
    );
};

export default CaptureImage;
