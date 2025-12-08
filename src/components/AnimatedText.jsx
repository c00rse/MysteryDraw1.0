import React from 'react';
import "../styles/global.css"; // Upewnij się, że style dla animacji są dostępne

// Komponent przyjmuje tekst i wyświetla go jako animowane literki
export const AnimatedText = ({ text }) => {
    // Rozdzielamy tekst na tablicę liter: "Logo" -> ['L', 'o', 'g', 'o']
    const letters = text.split("");

    return (
        <h1 style={{ display: 'flex', fontSize: '4rem', cursor: 'default' }}>
            {letters.map((char, index) => (
                <div 
                    key={index} 
                    className="animated-char" // Klasę stylujemy w global.css lub module
                    style={{ 
                        display: 'flex', 
                        fontStyle: 'italic',
                        transition: 'color 0.1s ease-in-out, scale 0.1s ease-in-out'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--accent-color)";
                        e.currentTarget.style.transform = "scale(1.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = "";
                        e.currentTarget.style.transform = "scale(1)";
                    }}
                >
                    {char}
                </div>
            ))}
        </h1>
    );
};