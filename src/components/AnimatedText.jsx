import React from 'react';
import "../styles/global.css"; 

// Dodano prop 'fontSize' z wartością domyślną '4rem'
export const AnimatedText = ({ text, fontSize = '4rem' }) => {
    const letters = text.split("");

    return (
        <h1 style={{ 
            display: 'flex', 
            fontSize: fontSize, // Używamy zmiennej
            cursor: 'default',
            margin: 0,          // Reset marginesów, żeby łatwiej pozycjonować
            lineHeight: 1       // Zapobiega dziwnym odstępom
        }}>
            {letters.map((char, index) => (
                <div 
                    key={index} 
                    className="animated-char"
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