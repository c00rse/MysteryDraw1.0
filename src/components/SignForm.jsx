import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { Register } from "./Register";
import { Login } from "./Login";
import { useStore } from '@nanostores/react';
import { isLoginOpen } from "../utils/modalStore";

export default function SignForm({ registerLabel, loginLabel, registerText, loginText }) {
    // Stan globalny widoczności
    const $isOpen = useStore(isLoginOpen);
    const [activeTab, setActiveTab] = useState("register");
    
    // Sprawdzamy stan auth, żeby ewentualnie przekierować
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                // Jeśli użytkownik jest zalogowany, przekierowujemy
                window.location.href = '/dashboard/';
            }
        });
        return () => unsubscribe();
    }, []);

    // Jeśli zamknięty, nic nie pokazuj
    if (!$isOpen) return null;

    return (
        <div className="PopUp">
            <section>
                <nav>
                    <ul>
                        <li
                            className={activeTab === "register" ? "active" : ""}
                            onClick={() => setActiveTab("register")}
                        >
                            {registerLabel}
                        </li>
                        <li
                            className={activeTab === "login" ? "active" : ""}
                            onClick={() => setActiveTab("login")}
                        >
                            {loginLabel}
                        </li>
                    </ul>
                    {/* Zamykanie przez ustawienie false w store */}
                    <div id="closeBtn" className="closeIcon" onClick={() => isLoginOpen.set(false)}>
                        <svg id="x1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328 328">
                            <line className="x" x1="20" y1="20" x2="308" y2="308" />
                        </svg>
                        <svg id="x2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 328 328">
                            <line className="x" x1="308" y1="20" x2="10" y2="308" />
                        </svg>
                    </div>
                </nav>

                {activeTab === "register" && (
                    <Register registerLabel={registerLabel} registerText={registerText} />
                )}
                {activeTab === "login" && (
                    <Login loginLabel={loginLabel} loginText={loginText} />
                )}
            </section>
        </div>
    );
}