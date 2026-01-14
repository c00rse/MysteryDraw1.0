import { auth } from "../utils/firebase";
import { signOut } from "firebase/auth";
import { useClientTranslation } from "../utils/useClientTranslation";

export const LogOut = () => {
    const { t } = useClientTranslation();

    /**
     * Funkcja handleLogout wywołuje proces wylogowania w Firebase 
     * i resetuje stan aplikacji poprzez przekierowanie.
     */
    const handleLogout = async () => {
        try {
            // Zakończenie sesji po stronie serwera Firebase
            await signOut(auth);
            
            // Powrót do strony głównej z odświeżeniem
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <div 
            onClick={handleLogout} 
            className="logout-text-btn"
            title={t("logOutBtn")}
        >
            {t("logOutBtn")}
        </div>
    );
};