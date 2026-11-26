# Wspólny Jadłospis

Aplikacja na Androida (i strona), która:

- układa jadłospis na 1–14 dni dla kilku osób, każda z własnym limitem kalorii,
- liczy dzienne zapotrzebowanie kaloryczne (płeć, wiek, waga, wzrost, aktywność, cel),
- uwzględnia dietę bez mięsa, bez glutenu, bez laktozy i wykluczone produkty,
- liczy z jadłospisu wspólną listę zakupów z odhaczaniem,
- odczytuje przepis ze zdjęcia i sam wybiera składniki oraz kalorie.

## Instalacja na telefonie

Każda zmiana w repozytorium buduje nowy plik APK (zakładka **Actions**). Gotowy plik
`wspolny-jadlospis.apk` jest w zakładce **Releases**. Pobierz go na telefon, otwórz
i zezwól na instalację z tego źródła. Kolejne wersje instalują się jako aktualizacja.

## Wspólna lista (Firebase)

Bez konfiguracji aplikacja trzyma dane tylko na telefonie. Żeby dzielić je między
telefonami, jedna osoba zakłada darmowy projekt Firebase:

1. Wejdź na https://console.firebase.google.com i utwórz projekt.
2. **Build → Authentication → Sign-in method**: włącz **Anonymous**.
3. **Build → Firestore Database**: utwórz bazę (tryb produkcyjny), a w zakładce
   **Rules** wklej zawartość pliku `firestore.rules` i opublikuj.
4. **Ustawienia projektu → Twoje aplikacje → Web (`</>`)**: zarejestruj aplikację
   i skopiuj obiekt `firebaseConfig`.
5. Wklej go do pliku `firebase-config.js` w miejsce `null`.

W aplikacji jedna osoba wybiera „Utwórz wspólny dom” i podaje drugiej 8-znakowy kod.
Nikt nie zakłada konta: telefon loguje się anonimowo, a dostęp daje znajomość kodu.

## Skanowanie przepisów

W zakładce **Dieta** wklej klucz API Claude (https://console.anthropic.com → API keys).
Klucz jest zapisany w waszym wspólnym domu, więc skanować mogą wszyscy domownicy.

## Budowanie

```
npm ci
npm run android          # składa www/ i kopiuje do projektu Androida
cd android && ./gradlew assembleDebug
```

`index.html` jest jednym źródłem dla aplikacji i dla wersji opublikowanej jako artefakt Claude.
