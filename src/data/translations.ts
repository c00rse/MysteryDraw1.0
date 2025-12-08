export const translations = {
    en: {
        // Strona główna
        indexButton: "Sign up | Log in",
        indexDescription: "To create or join a draw!",
        SignFormLogin: "Log in",
        SignFormRegister: "Register",
        registerText: "Sign up with",
        loginText: "Sign in with",
        emailPlaceholder: "email@example.com",
        passwordPlaceholder: "●●●●●●●●",
        
        // Dashboard - Ogólne
        loading: "loading...",
        anonymous: "Anonymous",
        cancel: "Cancel",
        save: "Save",
        saving: "Saving...",
        
        // UserProfile
        changeNickTitle: "Click to change nickname",
        
        // FriendList
        friendsHeader: "Friends",
        addFriendBtn: "+ add friend",
        unknownFriend: "Unknown Friend",
        
        // Modal: Add Friend
        modalAddTitle: "Add new friend",
        modalAddInputPlaceholder: "Enter friend's email",
        modalAddSubmitBtn: "Add Friend",
        // Statusy dodawania
        statusSearching: "Searching...",
        statusSelfAdd: "You cannot add yourself.",
        statusNotFound: "User not found.",
        statusAlreadyFriend: "This user is already your friend.",
        statusSuccess: "Friend added successfully!",
        statusError: "An error occurred.",
        
        // Modal: Change Name
        modalNameTitle: "Change your nickname",
        modalNameInputPlaceholder: "Enter new nickname",
        errorNameChange: "Error changing name.",
        
        // Modal: Delete Friend
        modalDeleteTitle: "Remove Friend?",
        modalDeleteDesc: "Are you sure you want to remove this person from your friends list?",
        btnDeleteConfirm: "Yes, remove",
        btnDeleting: "Removing...",
        errorDelete: "Error removing friend",

        // New Draw
        newDrawBtn: "New draw",
        createDrawTitle: "Create new draw",
        labelDrawTitle: "Draw title",
        labelDate: "Date of the event",
        labelBudget: "Budget",
        labelCurrency: "Currency (e.g. USD)",
        sectionParticipants: "Participants",
        btnCreateDraw: "Create Draw",
        drawSuccessTitle: "Draw Created!",
        drawSuccessBtn: "Ok!",
        
        // Draw Card
        daysLeft: "days left",
        finished: "finished",

        ongoingDraws: "Ongoing Draws",
        finishedDraws: "Finished", // Lub "Finished Draws"
    },
    pl: {
        // Strona główna
        indexButton: "Zarejestruj | Zaloguj",
        indexDescription: "Aby utworzyć lub dołączyć do losowania!",
        SignFormLogin: "Zaloguj",
        SignFormRegister: "Utwórz konto",
        registerText: "Zarejestruj z",
        loginText: "Zaloguj z",
        emailPlaceholder: "twoj@email.com",
        passwordPlaceholder: "●●●●●●●●",

        // Dashboard - Ogólne
        loading: "ładowanie...",
        anonymous: "Anonim",
        cancel: "Anuluj",
        save: "Zapisz",
        saving: "Zapisywanie...",

        // UserProfile
        changeNickTitle: "Kliknij, aby zmienić nick",

        // FriendList
        friendsHeader: "Znajomi",
        addFriendBtn: "+ dodaj znajomego",
        unknownFriend: "Nieznajomy",

        // Modal: Add Friend
        modalAddTitle: "Dodaj znajomego",
        modalAddInputPlaceholder: "Wpisz email znajomego",
        modalAddSubmitBtn: "Dodaj",
        // Statusy dodawania
        statusSearching: "Szukam...",
        statusSelfAdd: "Nie możesz dodać samego siebie.",
        statusNotFound: "Użytkownik nie znaleziony.",
        statusAlreadyFriend: "Ten użytkownik jest już twoim znajomym.",
        statusSuccess: "Znajomy dodany pomyślnie!",
        statusError: "Wystąpił błąd.",

        // Modal: Change Name
        modalNameTitle: "Zmień swój nick",
        modalNameInputPlaceholder: "Wpisz nowy nick",
        errorNameChange: "Błąd zmiany nazwy.",

        // Modal: Delete Friend
        modalDeleteTitle: "Usunąć znajomego?",
        modalDeleteDesc: "Czy na pewno chcesz usunąć tę osobę z listy znajomych?",
        btnDeleteConfirm: "Tak, usuń",
        btnDeleting: "Usuwanie...",
        errorDelete: "Błąd usuwania znajomego",

        // New Draw
        newDrawBtn: "Nowe losowanie",
        createDrawTitle: "Utwórz losowanie",
        labelDrawTitle: "Tytuł losowania",
        labelDate: "Data wydarzenia",
        labelBudget: "Budżet",
        labelCurrency: "Waluta (np. PLN)",
        sectionParticipants: "Uczestnicy",
        btnCreateDraw: "Utwórz losowanie",
        drawSuccessTitle: "Utworzono losowanie!",
        drawSuccessBtn: "Ok!",

        // Draw Card
        daysLeft: "dni do końca",
        finished: "zakończone",

        ongoingDraws: "Aktualne losowania",
        finishedDraws: "Zakończone",
    },
} as const;

export type Locale = keyof typeof translations;
export type TranslationKeys = keyof typeof translations[Locale];