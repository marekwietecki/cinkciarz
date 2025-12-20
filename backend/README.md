Spis treści
- [Opis](#użycie-endpointów)
- [Autoryzacja](#autoryzacja)
- [Ścieżki API NBP](#ścieżki-api-nbp)
- [Lista walut](#lista-walut)
- [Portfele](#portfele)
- [Tranzakcje](#tranzakcje)

## Użycie endpointów

Serwer działa na porcie 19000, na localhost\
http://localhost:19000/

## Dostępne endpointy z przykładami użycia i wypisanymi zmiennymi

### Autoryzacja

- Rejestracja:

` POST http://localhost:19000/api/auth/register `
```
curl -X POST http://localhost:19000/api/auth/register \
-H "Content-Type: application/json" \
-d '{"email":"aleksandra@wp.pl", "password":"aleksandra@wp.pl"}'
```
Zmienne: email; password


- Logowanie:

` POST http://localhost:19000/api/auth/login `
```
curl -X POST http://localhost:19000/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"aleksandra@wp.pl", "password":"aleksandra@wp.pl"}'
```
Zmienne: token; email; password

- Zamiana hasła:

` PUT http://localhost:19000/api/auth/change-password `
```
curl -X PUT http://localhost:19000/api/auth/change-password \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxNywiaWF0IjoxNzY1NTMyMDU2fQ.NuuVoU4cZme9M8vcwsApngCkt1FO7lqTBL6KGhw7H9s" \
-d '{"oldPassword":"aleksandra@wp.pl", "newPassword":"INNE_HASLO@wp.pl"}'
```
Zmienne: token; stare hasło; nowe hasło


- Usunięcie konta:

` PUT http://localhost:19000/api/auth/delete `
```
curl -X DELETE http://localhost:19000/api/auth/delete \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxNywiaWF0IjoxNzY1NTMyMDU2fQ.NuuVoU4cZme9M8vcwsApngCkt1FO7lqTBL6KGhw7H9s" \
-d '{"email":"aleksandra@wp.pl", "password":"aleksandra@wp.pl"}'
```
Zmienne: token; email; hasło


### Ścieżki API NBP

- Pobranie kursów:

` GET http://localhost:19000/api/nbp/table/:tableLetter `
```
curl -X GET http://localhost:19000/api/nbp/table/A?startDate=2024-10-10&endDate=2024-10-13
```
Zmienne: nazwa tabeli (obowiązkowa); data początkowa*; data końcowa*\
\* - dane nieobowiąkowe, ale muszą wystąpić jednocześnie


- Pobranie kursów:

` GET http://localhost:19000/api/nbp/rate/:tableLetter/:currencyCode `
```
curl -X GET http://localhost:19000/api/nbp/rate/A/USD?endDate=2024-10-10&startDate=2024-10-13
```
Zmienne: nazwa tabeli (obowiązkowa); symbol waluty (obowiązkowy); data początkowa*; data końcowa*\
\* - dane nieobowiąkowe, ale muszą wystąpić jednocześnie

Endpoint zwraca pierwszy chronologicznie kurs z podanego zakresu dat lub dzisiejszy w przypadku pominięcia dat.


### Lista walut

- Pobranie tablicy z walutami dostępnymi na serwerze:

` GET http://localhost:19000/api/currency `
```
curl -X GET http://localhost:19000/api/currency
```


- Pobranie informacji o danej walutcie:

` GET http://localhost:19000/api/currency/:currencyCode `
```
curl -X GET http://localhost:19000/api/currency/USD
```
Zmienne: symbol waluty (obowiązkowy)


## Obsługa portfeli

- Stworzenie pustego portfela:

` POST http://localhost:19000/api/wallet/create `
```
curl -X POST http://localhost:19000/api/wallet/create \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxOSwiaWF0IjoxNzY1ODg3MTIyfQ.NvmGfQ7gTjcerfQwk20f07UMzysvDZJbILZ0FUzEMMM"
```
Zmienne: token


- Odczytanie portfela, czyli id portfela oraz id użytkownika:

` GET http://localhost:19000/api/wallet/id `
```
curl -G GET http://localhost:19000/api/wallet/id \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: token


- Odczytanie wszystkich portfeli walutowych użytkownika:

` GET http://localhost:19000/api/wallet `
```
curl -G GET http://localhost:19000/api/wallet \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: token


- Stworzenie portfela walutowego:

` POST http://localhost:19000/api/wallet/create/:currencyCode `
```
curl -X POST http://localhost:19000/api/wallet/create/USD \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: kod waluty; token


- Usunięcie portfela walutowego:

` DELETE http://localhost:19000/api/wallet/delete/:currencyCode `
```
curl -X DELETE http://localhost:19000/api/wallet/delete/USD \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: kod waluty; token


- Usunięcie całego portfela użytkownika wraz ze wszystkimi portfelami walutowymi:

` DELETE http://localhost:19000/api/wallet/delete `
```
curl -X DELETE http://localhost:19000/api/wallet/delete \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: token


## Tranzakcje

- Zdeponowanie pieniędzy w danej walucie na portfelu walutowym

` POST http://localhost:19000/api/transaction/deposit `
```
curl -X POST http://localhost:19000/api/transaction/deposit \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o" \
-d '{"amount":"100", "currency":"USD"}'
```
Zmienne: token; ilość pieniędzy; kod waluty


- Wybranie pieniędzy z danej waluty

` POST http://localhost:19000/api/transaction/withdraw `
```
curl -X POST http://localhost:19000/api/transaction/withdraw \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxOSwiaWF0IjoxNzY1ODg3MTIyfQ.NvmGfQ7gTjcerfQwk20f07UMzysvDZJbILZ0FUzEMMM" \
-d '{"amount":"100", "currency":"USD"}'
```
Zmienne: token; ilość pieniędzy; kod waluty


- Przewalutowanie pieniędzy z jednej waluty (A) na walutę (B) po danym kursie

` POST http://localhost:19000/api/transaction/exchange `
```
curl -X POST http://localhost:19000/api/transaction/withdraw \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxOSwiaWF0IjoxNzY1ODg3MTIyfQ.NvmGfQ7gTjcerfQwk20f07UMzysvDZJbILZ0FUzEMMM" \
-d '{"fromCurrency":"USD", "toCurrency":"EUR", "fromAmount":"10", "toAmount":"202", "rate":"2.0"}'
```
Zmienne:
1. token;
2. kod waluty A (fromCurrency);
3. kod waluty B (toCurrency);
4. ilość waluty A, która zostanie wydana na przewalutowanie (fromAmount);
5. ilość waluty B, która zostanie dodana (toAmount);
6. kurs, po jakim zostanie wykonane przewalutowanie (rate).

---

- Uzyskanie historii tranzakcji\
<b>ENDPOINT JESZCZE NIE UKOŃCZONY</b>

` GET http://localhost:19000/api/transaction/history `

```
curl -X POST http://localhost:19000/api/transaction/withdraw \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUxOSwiaWF0IjoxNzY1ODg3MTIyfQ.NvmGfQ7gTjcerfQwk20f07UMzysvDZJbILZ0FUzEMMM" \
-d '{"startDate":"2025-12-16T12:13:02.974", "endDate":"2025-11-16T12:13:02.974", "limit":"10", "currency":"USD", "order":"ASC"}'
```
Zmienne:
1. token;
2. & data początkowa i końcowa (startDate, endDate) - kolejnośc pomijalna;
3. & ilość rekordów do uzyskania z historii (limit);
4. kod waluty (code, currency, currencyCode);
5. & kolejność chronologiczna lub antychronologiczna (order);

& - dane opcjonalne.

