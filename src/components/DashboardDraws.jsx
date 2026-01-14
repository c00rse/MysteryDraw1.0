import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import DrawCard from "./DrawCard";
import { useClientTranslation } from "../utils/useClientTranslation";
import "../styles/DashboardDraws.css"; 

/**
 * Komponent DashboardDraws - Kontener dla list losowań (ongoing i finished).
 */
export default function DashboardDraws() {
    const { t } = useClientTranslation();
    const { uid } = useUserData();

    const [ongoingDraws, setOngoingDraws] = useState([]);
    const [finishedDraws, setFinishedDraws] = useState([]);

    useEffect(() => {
        if (!uid) return;

        // Zapytanie o wszystkie losowania, w których bierze udział użytkownik
        const q = query(
            collection(db, "draws"), 
            where("participantIds", "array-contains", uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const ongoing = [];
            const finished = [];

            snapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                const deadline = data.deadline.toDate();

                // Podział na trwające i zakończone na podstawie aktualnej daty
                if (deadline > now) {
                    ongoing.push(data);
                } else {
                    finished.push(data);
                }
            });

            // Sortowanie chronologiczne
            ongoing.sort((a, b) => a.deadline.toDate() - b.deadline.toDate());
            finished.sort((a, b) => b.deadline.toDate() - a.deadline.toDate());

            setOngoingDraws(ongoing);
            setFinishedDraws(finished);
        });

        return () => unsubscribe();
    }, [uid]);

    const panelStyle = {
        backgroundColor: "var(--main-color)",
        padding: "1rem",
        borderRadius: "1rem",
        margin: "0.5rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    };

    return (
        <>
            <div id="ongoing" style={{ ...panelStyle, gridColumn: "2 / 3", gridRow: "1 / 3" }}>
                <h2 style={{marginTop: 0, flexShrink: 0}}>{t("ongoingDraws")}</h2>
                <div className="scroll-content">
                    {ongoingDraws.length === 0 && <p style={{opacity: 0.5}}>No active draws.</p>}
                    {ongoingDraws.map(draw => (
                        <DrawCard key={draw.id} drawData={draw} isFinished={false} />
                    ))}
                </div>
            </div>

            <div id="finished" style={{ ...panelStyle, gridColumn: "2 / 3", gridRow: "3 / 5" }}>
                <h2 style={{marginTop: 0, flexShrink: 0}}>{t("finishedDraws")}</h2>
                <div className="scroll-content">
                    {finishedDraws.length === 0 && <p style={{opacity: 0.5}}>No finished history.</p>}
                    {finishedDraws.map(draw => (
                        <DrawCard key={draw.id} drawData={draw} isFinished={true} />
                    ))}
                </div>
            </div>
        </>
    );
}