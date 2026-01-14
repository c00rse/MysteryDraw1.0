export function performDraw(participants) {

    let pool = [...participants];
    let drawMap = {};
    let isValid = false;

    // Próbujemy wylosować tak długo, aż każdy wylosuje kogoś innego niż siebie

    while (!isValid) {
        // Mieszamy pulę
        for (let i = pool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [pool[j], pool[i]];
        }

        // Sprawdzamy czy nikt nie trafił na siebie
        let selfMatch = false;
        for (let i = 0; i < participants.length; i++) {
            if (participants[i] === pool[i]) {
                selfMatch = true;
                break;
            }
        }

        if (!selfMatch) {
            isValid = true;
            // Tworzymy mapę wyników
            for (let i = 0; i < participants.length; i++) {
                drawMap[participants[i]] = pool[i];
            }
        }
    }

    return drawMap;
}