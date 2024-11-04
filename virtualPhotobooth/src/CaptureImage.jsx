import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Webcam from 'react-webcam';
import './CaptureImage.css';
import overlayImage from './assets/overlay.png';
import CaptureIcon from './assets/Capture.png';
import ReplaceIcon from './assets/Retake.png';
import SaveIcon from './assets/Save.svg';
import SubmitIcon from './assets/Submit.png';
import BackButton from './assets/Back.png';
import logo2 from './assets/logo2.png';

const CaptureImage = ({ userInfo }) => {
    const [image, setImage] = useState(null);
    const [overlayedImage, setOverlayedImage] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const webcamRef = useRef(null);
    const navigate = useNavigate();

    // Capture image from webcam
    const captureImage = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            setImage(imageSrc);
            applyOverlay(imageSrc);
        } else {
            setErrorMessage('Failed to capture image. Please try again.');
        }
    };

    // Apply overlay to the captured image without changing its ratio
    const applyOverlay = (imageSrc) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const img = new Image();
        const overlay = new Image();

        img.src = imageSrc;
        overlay.src = overlayImage;

        img.onload = () => {
            overlay.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);
                ctx.drawImage(overlay, 0, 0, img.width, img.height);
                setOverlayedImage(canvas.toDataURL());
            };
        };
    };

    // Retake image
    const handleRetake = () => {
        setImage(null);
        setOverlayedImage(null);
        setSuccessMessage('');
        setErrorMessage('');
    };

    // Handle image upload
    const handleUpload = async () => {
        if (!overlayedImage) {
            setErrorMessage('Please capture an image before uploading.');
            return;
        }

        const response = await fetch(overlayedImage);
        const blob = await response.blob();
        const formData = new FormData();
        formData.append('image', blob, 'captured_image.png');

        if (userInfo && userInfo.name && userInfo.email && userInfo.department) {
            formData.append('name', userInfo.name);
            formData.append('email', userInfo.email);
            formData.append('department', userInfo.department);
        } else {
            setErrorMessage('User information is missing.');
            return;
        }

        try {
            const res = await axios.post('https://main2-2.onrender.com/api/upload', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 200) {
                setSuccessMessage('Image uploaded successfully! An email with your photo has been sent to you.');
                setTimeout(() => {
                    navigate('/register');
                }, 2000);
            }
        } catch (error) {
            console.error('Image upload error:', error.response ? error.response.data : error.message);
            setErrorMessage(error.response?.data?.error || 'Failed to upload image. Please try again.');
        }
    };

    // Save image function
    const handleSave = () => {
        if (!overlayedImage) {
            setErrorMessage('Please capture an image before saving.');
            return;
        }

        const link = document.createElement('a');
        link.href = overlayedImage;
        link.download = 'captured_image_with_overlay.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Back navigation
    const handleBack = () => {
        navigate(-1);
    };

    return (
        <div className="capture-container">
            <img src={logo2} alt="Logo" className="logo" style={{ width: '100px', marginTop: '-20px'}} />
            <h2 className="title" style={{ marginTop: '-20px'}}>SUSTAINABILITY E-COMMITMENT</h2>
            <p className="subtitle" style={{ marginTop: '5px'}}>PHOTO COLLAGE</p>
            <div className="webcam-container">
                {!overlayedImage ? (
                    <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/png"
                        mirrored={false}
                        className="webcam"
                    />
                ) : (
                    <div className="captured-image-container">
                        <img src={overlayedImage} alt="Captured with Overlay" className="captured-image" />
                    </div>
                )}
            </div>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <div className="button-container">
                {!overlayedImage ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleBack} className="action-button back-button">
                            <img src={BackButton} alt="Back" className='btnAction' />
                        </button>
                        <button onClick={captureImage} className="action-button capture-button">
                            <img src={CaptureIcon} alt="Capture" className='btnAction' /> 
                        </button>
                    </div>
                ) : (
                    <>
                        <button onClick={handleRetake} className="action-button back-button">
                            <img src={ReplaceIcon} alt="Replace" className='btnAction' />
                        </button>
                        <button onClick={handleUpload} className="action-button submit-button">
                            <img src={SubmitIcon} alt="Submit" className='btnAction' />
                        </button>
                        <button onClick={handleSave} className="action-button save-button">
                            <img src={SaveIcon} alt="Save" className='btnAction' />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CaptureImage;
