import { useEffect, useState } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/DrawCard.css";
import { useClientTranslation } from "../utils/useClientTranslation";
import useUserData from "../scripts/useUserData";
import { selectedDraw } from "../utils/modalStore";

export default function DrawCard({ drawData, isFinished }) {
    const { t } = useClientTranslation();
    const { seenDraws } = useUserData();
    const { title, deadline, budget, currency, participantIds, id } = drawData;
    
    // Sprawdzamy czy losowanie jest "nowe"
    // Jest nowe jeśli: NIE jest zakończone ORAZ id nie znajduje się w seenDraws
    const isNew = !isFinished && seenDraws && !seenDraws.includes(id);

    const deadlineDate = deadline.toDate();
    const now = new Date();
    const diffTime = Math.abs(deadlineDate - now);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    const formattedDate = deadlineDate.toLocaleDateString();

    const [avatars, setAvatars] = useState([]);
    
    useEffect(() => {
        const fetchAvatars = async () => {
            const idsToFetch = participantIds.slice(0, 4);
            const loaded = [];
            for (const uid of idsToFetch) {
                try {
                    const snap = await getDoc(doc(db, "users", uid));
                    loaded.push(snap.exists() ? (snap.data().picUrl || "/default.png") : "/default.png");
                } catch(e) { loaded.push("/default.png"); }
            }
            setAvatars(loaded);
        };
        fetchAvatars();
    }, [participantIds]);

    const extraCount = participantIds.length - 4;

    const handleClick = () => {
        // Otwieramy modal przekazując dane losowania oraz flagę czy jest nowe
        selectedDraw.set({ ...drawData, isNew: isNew });
    };

    return (
        <div className={`draw-card ${isFinished ? 'finished' : ''}`} onClick={handleClick}>
            <div className="card-left">
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <h3>{title}</h3>
                    {/* DIODA */}
                    {isNew && <div className="pulsing-diode"></div>}
                </div>
                
                <div className="avatars-row">
                    {avatars.map((url, index) => (
                        <img key={index} src={url} className="card-avatar" alt="p" />
                    ))}
                    {extraCount > 0 && (
                        <div className="extra-bubbles">
                            <div className="bubble-shadow" style={{left: '0px'}}></div>
                            <div className="bubble-shadow" style={{left: '10px'}}></div>
                            <div className="bubble-text" style={{left: '20px'}}>+{extraCount}</div>
                        </div>
                    )}
                </div>
            </div>

            <div className="card-right">
                <div className="deadline-box">
                    <span className={`date ${isFinished ? 'crossed' : ''}`}>{formattedDate}</span>
                    {isFinished ? (
                        <span className="status-finished">{t("finished")}</span>
                    ) : (
                        <span className="days-left">{diffDays} {t("daysLeft")}</span>
                    )}
                </div>
                {!isFinished && (
                    <div className="budget-box">{budget} {currency}</div>
                )}
            </div>
        </div>
    );
}