// round button with home icon when clicked takes user to root page which is the home page
import React from 'react';

const HomeButton = () => {
    return (
        <button onClick={() => window.location.href = '/'}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2L2 12h3v10h14V12h3z"/>
        </svg>
        </button>
    );
};

export default HomeButton;