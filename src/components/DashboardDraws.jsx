import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import useUserData from "../scripts/useUserData";
import DrawCard from "./DrawCard";
import { useClientTranslation } from "../utils/useClientTranslation";

// Import stylów scrollbara
import "../styles/DashboardDraws.css"; 

export default function DashboardDraws() {
    const { t } = useClientTranslation();
    const { uid } = useUserData();
    const [ongoingDraws, setOngoingDraws] = useState([]);
    const [finishedDraws, setFinishedDraws] = useState([]);

    useEffect(() => {
        if (!uid) return;

        const q = query(collection(db, "draws"), where("participantIds", "array-contains", uid));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const ongoing = [];
            const finished = [];

            snapshot.forEach((doc) => {
                const data = { id: doc.id, ...doc.data() };
                const deadline = data.deadline.toDate();

                if (deadline > now) {
                    ongoing.push(data);
                } else {
                    finished.push(data);
                }
            });

            ongoing.sort((a, b) => a.deadline.toDate() - b.deadline.toDate());
            finished.sort((a, b) => b.deadline.toDate() - a.deadline.toDate());

            setOngoingDraws(ongoing);
            setFinishedDraws(finished);
        });

        return () => unsubscribe();
    }, [uid]);

    // Styl dla GŁÓWNEGO kontenera (Ramka)
    // Nie ma overflowY, bo ramka ma stać w miejscu.
    // Ma display: flex, żeby zarządzać układem nagłówek vs lista.
    const panelStyle = {
        backgroundColor: "var(--main-color)",
        padding: "1rem",
        borderRadius: "1rem",
        margin: "0.5rem",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden" // Ukrywa wszystko co wystaje poza zaokrąglenia
    };

    return (
        <>
            {/* Panel Ongoing */}
            <div id="ongoing" style={{ ...panelStyle, gridColumn: "2 / 3", gridRow: "1 / 3" }}>
                {/* Tytuł jest sztywny (flex item bez shrink) */}
                <h2 style={{marginTop: 0, flexShrink: 0}}>{t("ongoingDraws")}</h2>
                
                {/* Lista jest przewijana (zajmuje resztę miejsca) */}
                <div className="scroll-content">
                    {ongoingDraws.length === 0 && <p style={{opacity: 0.5}}>No active draws.</p>}
                    {ongoingDraws.map(draw => (
                        <DrawCard key={draw.id} drawData={draw} isFinished={false} />
                    ))}
                </div>
            </div>

            {/* Panel Finished */}
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