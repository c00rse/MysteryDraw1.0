import { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

/**
 * Custom Hook zarządzający stanem użytkownika.
 * Łączy Firebase Authentication z danymi profilowymi z Firestore w czasie rzeczywistym.
 */
export default function useUserData() {
    // Stan przechowujący podstawowe informacje o profilu i techniczne flagi
    const [uid, setUid] = useState(null);
    const [picUrl, setPicUrl] = useState(null);
    const [username, setUsername] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [seenDraws, setSeenDraws] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [loading, setLoading] = useState(true); // Flaga informująca o trwaniu pobierania danych

    useEffect(() => {
        // 1. NASŁUCHIWANIE STANU AUTORYZACJI
        // Wywołuje się przy każdym zalogowaniu/wylogowaniu użytkownika
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Ustawiamy dane pochodzące bezpośrednio z modułu Auth
                setPicUrl(user.photoURL);
                setUid(user.uid);
                setUserEmail(user.email);

                // Referencja do dokumentu użytkownika w kolekcji 'users'
                const userDocRef = doc(db, 'users', user.uid);

                // 2. NASŁUCHIWANIE BAZY DANYCH (Real-time Snapshot)
                // Automatycznie aktualizuje interfejs, gdy zmienią się dane w Firestore
                const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        // Jeśli użytkownik istnieje w bazie, pobieramy jego dane
                        const data = docSnap.data();
                        setUsername(data.username);
                        setFriendList(data.friends || []);
                        setSeenDraws(data.seenDraws || []);
                    } else {
                        // LOGIKA PIERWSZEGO LOGOWANIA:
                        // Jeśli użytkownika nie ma w bazie Firestore, tworzymy mu domyślny profil
                        const defaultName = "Set your nick!";
                        await setDoc(userDocRef, {
                            username: defaultName,
                            email: user.email,
                            picUrl: user.photoURL,
                            friends: [],
                            seenDraws: [],
                        });
                        setUsername(defaultName);
                        setFriendList([]);
                        setSeenDraws([]);
                    }
                    setLoading(false); // Dane załadowane (z bazy lub po utworzeniu profilu)
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    setLoading(false);
                });

                // Zwracamy funkcję czyszczącą nasłuchiwanie bazy (Firestore listener)
                return () => unsubscribeSnapshot();

            } else {
                // CZYSZCZENIE STANU PRZY WYLOGOWANIU
                setPicUrl(null);
                setUsername(null);
                setUid(null);
                setUserEmail(null);
                setFriendList([]);
                setSeenDraws([]);
                setLoading(false);
            }
        });

        // Zwracamy funkcję czyszczącą nasłuchiwanie autoryzacji (Auth listener)
        return () => unsubscribeAuth();
    }, []);

    // Eksportujemy dane oraz settery, aby inne komponenty mogły z nich korzystać
    return { uid, picUrl, username, setUsername, friendList, setFriendList, seenDraws, userEmail, loading };
}