import { useState } from "react";
import { auth, googleProvider } from "../utils/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useClientTranslation } from "../utils/useClientTranslation";

export const Register = ({ registerLabel, registerText }) => {
    // Hook do tłumaczeń
    const { t } = useClientTranslation();

    // Stany
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Funkcja rejestracji
    const createAccount = async () => {
        setError("");
        
        // Walidacja
        if(password.length < 6) {
            setError("Hasło musi mieć min. 6 znaków.");
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/email-already-in-use') {
                setError("Ten email jest już zajęty.");
            } else if (err.code === 'auth/invalid-email') {
                setError("Niepoprawny format emaila.");
            } else {
                setError("Błąd rejestracji.");
            }
        }
    }

    // Funkcja rejestracji przez Google
    const signInWithGoogle = async () => {
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error(err);
            setError("Błąd rejestracji przez Google.");
        }
    }

    return (        
        <section className="form">
            <h2>{registerLabel}</h2>
            
            <span>
                <div className="inputWrapper">
                    <label htmlFor="email">email:</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder={t("emailPlaceholder")} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div className="inputWrapper">
                    <label htmlFor="password">password:</label>
                    <input 
                        type="password" 
                        name="password" 
                        placeholder={t("passwordPlaceholder")} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Wyświetlanie błędów */}
                {error && <p style={{ color: "red", fontSize: "0.9rem", margin: "0" }}>{error}</p>}
            </span>

            <div className="buttonsWrapper">
                <button onClick={createAccount} className="btn-glow btn-fill">
                    {registerLabel}
                </button>
                
                <div className="ruler" />
                
                <button onClick={signInWithGoogle} className="signWithGoogle">
                    <div className="content">
                        {registerText}
                        <svg className="googleIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path d="M564 325.8C564 467.3 467.1 568 324 568C186.8 568 76 457.2 76 320C76 182.8 186.8 72 324 72C390.8 72 447 96.5 490.3 136.9L422.8 201.8C334.5 116.6 170.3 180.6 170.3 320C170.3 406.5 239.4 476.6 324 476.6C422.2 476.6 459 406.2 464.8 369.7L324 369.7L324 284.4L560.1 284.4C562.4 297.1 564 309.3 564 325.8z" />
                        </svg>
                    </div>
                    <div className="underlineWrapper">
                        <div className="underline"></div>
                    </div>
                </button>
            </div>

        </section>
    )
}