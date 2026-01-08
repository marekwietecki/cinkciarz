# 💸 eWalutka - Mobilny System Wymiany Walut

Kompletny system mobilny umożliwiający bezpieczną wymianę walut, śledzenie kursów NBP oraz zarządzanie wirtualnym portfelem. Projekt łączy nowoczesny frontend mobilny z autorskim serwisem sieciowym i relacyjną bazą danych.

## Spis treści
- [Opis projektu](#opis-projektu)
- [Tech Stack](#tech-stack)
- [Zakres Funkcjonalny](#zakres-funkcjonalny)
- [Użycie endpointów](#użycie-endpointów)
- [Instalacja i konfiguracja](#instalacja-i-konfiguracja)
- [Licencja](#licencja)




## Opis Projektu
Projekt ma na celu praktyczne zastosowanie zagadnień związanych z komunikacją między aplikacją mobilną a serwisem sieciowym (REST) oraz bazą danych. System integruje się z zewnętrznym API Narodowego Banku Polskiego, zapewniając rzetelne dane finansowe.




## Tech Stack
* **Aplikacja Mobilna:** Expo / React Native (Context API, Expo Router)
* **Backend (Web Service):** Node.js / Express.js
* **Baza Danych:** SQLite
* **Integracja zewnętrzna:** API NBP (kursy walut)




## Zakres Funkcjonalny

### A. Aplikacja Mobilna
* **Autoryzacja:** Rejestracja i logowanie użytkowników (JWT).
* **Finanse:** Zasilenie konta (symulowany przelew) oraz podgląd stanu posiadanych środków.
* **Giełda Walut:** Pobieranie aktualnych kursów z NBP, dostęp do danych archiwalnych oraz realizacja transakcji kupna/sprzedaży.
* **Personalizacja:** 
    * Wybór awatara (system izolowany per e-mail użytkownika).
    * Dynamiczna zmiana motywu (Light/Dark) i języka (PL/EN).
    * Transparentność: Brak ukrytych kosztów – pełna informacja o transakcji przed jej zatwierdzeniem.

### B. Web Service (Node.js)
* Realizacja pełnej logiki biznesowej kantoru.
* Pośrednictwo w komunikacji z API NBP.
* Walidacja danych po stronie serwera oraz autoryzacja zapytań.

### C. Baza Danych (SQLite)
* Relacyjne przechowywanie informacji o użytkownikach.
* Rejestrowanie pełnej historii transakcji.
* Zapisywanie aktualnego stanu portfela walutowego.




## Użycie endpointów
Serwis sieciowy udostępnia zestaw ścieżek REST umożliwiających komunikację aplikacji z logiką biznesową i bazą danych.

### Autoryzacja
`app.use('/api/auth', authRoutes);`
- `POST /register` – Rejestracja nowego użytkownika.
- `POST /login` – Logowanie i uzyskanie tokena JWT.
- `GET /mail` – Pobranie adresu e-mail aktualnie zalogowanego użytkownika.
- `PUT /change-password` – Zmiana hasła użytkownika.
- `DELETE /delete` – Usunięcie konta użytkownika z systemu.

### Ścieżki API NBP
`app.use('/api/nbp', nbpRoutes);`
- `GET /rate/:tableLetter/:currencyCode` – Pobiera kurs konkretnej waluty z wybranej tabeli NBP.
- `GET /table/:tableLetter` – Pobiera pełną tabelę kursów (np. Tabela A lub B).

### Lista walut
`app.use('/api/currency', currencyRoutes);`
- `GET /` – Pobiera listę wszystkich wspieranych walut.
- `GET /:currencyCode` – Pobiera szczegółowe informacje o konkretnej walucie.

### Portfele
`app.use('/api/wallet', walletRoutes);`
- `GET /` – Pobiera listę wszystkich portfeli walutowych użytkownika.
- `POST /create` – Tworzy domyślny portfel użytkownika.
- `POST /create/:currencyCode` – Otwiera portfel dla konkretnej waluty.
- `GET /history` – Pobiera historię zmian w portfelach.
- `DELETE /delete` – Usuwa wszystkie portfele użytkownika.
- `DELETE /delete/:currencyCode` – Usuwa portfel konkretnej waluty.

### Transakcje
`app.use('/api/transaction', transactionRoutes);`
- `POST /deposit` – Zasilenie konta (symulowany wirtualny przelew).
- `POST /exchange` – Realizacja transakcji wymiany między walutami (kupno/sprzedaż).





## Instalacja i Konfiguracja

1.  **Klonowanie repozytorium:**
    ```bash
    git clone [https://github.com/marekwietecki/cinkciarz.git](https://github.com/marekwietecki/cinkciarz.git)
    ```

3.  **Konfiguracja Serwera:**
    W pliku config.js należy podmienić obecne ip na lokalne. 

    Aby aplikacja na fizycznym telefonie połączyła się z serwerem na komputerze przy użyciu aplikacji mobilnej Expo App, oba urządzenia muszą być w tej samej sieci Wi-Fi, a adres URL musi wskazywać na lokalne IP komputera. 

    Można je sprawdzić wpisując w konsolę polecenie:
    - Windows: Otwórz Wiersz Polecenia (cmd) i wpisz ipconfig. Szukaj pozycji IPv4 Address (np. 192.168.1.15).
    - macOS / Linux: Otwórz Terminal i wpisz ifconfig lub ip addr. Szukaj adresu przy en0 lub eth0 (zazwyczaj zaczyna się od 192.168.x.x).

3.  **Konfiguracja Backend (Node.js):**
    ```bash
    cd backend
    npm install
    node \server.js\
    ```

4.  **Konfiguracja Frontend (Expo):**
    ```bash
    npm install
    npx expo start
    ```




## Licencja
Projekt udostępniany na licencji **MIT**. Możesz dowolnie modyfikować i korzystać z kodu, pod warunkiem zachowania informacji o autorze.


---

**Autorzy:** Tomasz Turek & Marek Wietecki