import { useEffect, useState } from "react";
import { auth, db } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, onSnapshot } from "firebase/firestore"; // Dodano onSnapshot

export default function useUserData() {
    const [uid, setUid] = useState(null);
    const [picUrl, setPicUrl] = useState(null);
    const [username, setUsername] = useState(null);
    const [friendList, setFriendList] = useState([]);
    const [userEmail, setUserEmail] = useState(null); // Przydatne, aby nie dodać samego siebie

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setPicUrl(user.photoURL);
                setUid(user.uid);
                setUserEmail(user.email);

                const userDocRef = doc(db, 'users', user.uid);

                // ZMIANA: Używamy onSnapshot zamiast getDoc
                // Dzięki temu każda zmiana w bazie (np. dodanie znajomego)
                // automatycznie zaktualizuje stan w aplikacji
                const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
                    if (docSnap.exists()) {
                        setUsername(docSnap.data().username);
                        setFriendList(docSnap.data().friends || []);
                    } else {
                        // Tworzenie dokumentu jeśli nie istnieje
                        const defaultName = "Set your nick!";
                        await setDoc(userDocRef, {
                            username: defaultName,
                            email: user.email,
                            picUrl: user.photoURL,
                            friends: [],
                        });
                        setUsername(defaultName);
                        setFriendList([]);
                    }
                    setLoading(false);
                }, (error) => {
                    console.error("Error listening to user data:", error);
                    setLoading(false);
                });

                // Zwracamy funkcję czyszczącą snapshot listenera, gdy user się zmieni/wyloguje
                return () => unsubscribeSnapshot();

            } else {
                // Reset gdy użytkownik się wyloguje
                setPicUrl(null);
                setUsername(null);
                setUid(null);
                setUserEmail(null);
                setFriendList([]);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return { uid, picUrl, username, setUsername, friendList, setFriendList, userEmail, loading };
}