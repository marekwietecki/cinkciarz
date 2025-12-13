
## Portfele

- Stworzenie portfela:
` POST http://localhost:19000/api/wallet/create `
```
curl -X POST http://localhost:19000/api/wallet/create \
-H "Content-Type: application/json" \
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjIsImlhdCI6MTc2NTU3MTM1MX0._X2hgtGjy1UmMqDTwMNZca_ijaspLnNEKugPQn_Wr6o"
```
Zmienne: token


- Odczytanie id portfela oraz id użytkownika:
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
