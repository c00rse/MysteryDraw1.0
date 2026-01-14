import { useState } from "react";
import { auth, googleProvider } from "../utils/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useClientTranslation } from "../utils/useClientTranslation";

export const Login = ({ loginLabel, loginText }) => {
    // Hook do tłumaczeń
    const { t } = useClientTranslation();

    // Stany dla formularza
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    // Funkcja logowania hasłem i emailem
    const handleLogin = async () => {
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            console.error(err);
            // Obsługa błędów
            if (err.code === 'auth/invalid-credential') {
                setError("Błędny email lub hasło.");
            } else {
                setError("Wystąpił błąd logowania.");
            }
        }
    }

    // Funkcja logowania przez Google
    const handleGoogleLogin = async () => {
        setError("");
        try {
            await signInWithPopup(auth, googleProvider);
            // Przekierowanie automatyczne w SignForm
        } catch (err) {
            console.error(err);
            setError("Błąd logowania przez Google.");
        }
    }

    return (
        <section className="form">
            <h2>{loginLabel}</h2>
            
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
                
                {/* Wyświetlanie błędu jeśli wystąpił */}
                {error && <p style={{ color: "red", fontSize: "0.9rem", margin: "0" }}>{error}</p>}
            </span>

            <div className="buttonsWrapper">
                <button onClick={handleLogin} className="btn-glow btn-fill">
                    {loginLabel}
                </button>
                
                <div className="ruler" />
                
                <button onClick={handleGoogleLogin} className="signWithGoogle">
                    <div className="content">
                        {loginText}
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
