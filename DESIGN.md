---
name: La MAXIM
description: O invitație elegantă, construită în jurul fotografiilor reale ale locației.
colors:
  forest: "#203e35"
  forest-hover: "#2d5145"
  copper: "#946445"
  ivory: "#f7f5ef"
  paper: "#fffefa"
  muted-forest: "#626b60"
  rule: "#d7dbcf"
  input-stroke: "#7c8a74"
  error: "#953b30"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(56px, 4.7vw, 64px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  section:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "27px"
    fontWeight: 500
    letterSpacing: "-0.025em"
rounded:
  field: "2px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "24px"
  lg: "42px"
  xl: "72px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.field}"
    padding: "17px 20px"
  button-primary-hover:
    backgroundColor: "{colors.forest-hover}"
  input:
    textColor: "{colors.forest}"
    rounded: "{rounded.field}"
    height: "44px"
    padding: "0 13px"
---

# Design System: La MAXIM

## Overview

**Creative North Star: "O invitație personală"**

O compoziție calmă și primitoare. Fotografiile reale ale locației oferă atmosfera, iar tipografia și spațiul liber păstrează atenția asupra înscrierii. Direcția a fost aprobată de utilizator înainte de implementare, cu construire directă în React.

**Key Characteristics:**
- Titluri serif cu accente cursive de cupru.
- Fundal fildeș, text verde închis și suprafețe plate.
- Fotografii pătrate, texte precise și un singur obiectiv de participare.

## Colors

Forest este culoarea principală pentru text, butoane și stări bifate. Copper marchează accentul editorial și focusul. Ivory este fondul paginii, iar Paper apare în câmpul activ. Muted Forest păstrează textul secundar și placeholder-ele lizibile; Input Stroke delimitează controalele. Rule este rezervată separatoarelor decorative.

**The Readable Ink Rule.** Textul secundar folosește Muted Forest; nu se estompează prin opacitate.

## Typography

Cormorant Garamond oferă caracter titlurilor și countdown-ului. Manrope deservește textul, formularul și navigarea. Fonturile sunt găzduite local și includ diacritice românești. Cursivul din titluri este accent, nu un înlocuitor pentru structură semantică. Numărătoarea folosește cifre tabulare.

## Layout

Containerul are o lățime maximă de 1512px și margini interioare ample pe desktop. Sub 760px, compoziția devine o singură coloană, cu margini de 25px. Pe ecrane foarte înguste acestea scad la 20px. Câmpurile Nume și Prenume rămân alăturate, iar telefonul și acțiunea ocupă lățimea formularului. Fotografiile își păstrează cadrele pătrate.

## Elevation & Depth

Suprafețele sunt plate. Fotografia de seară poartă adâncimea vizuală; singura umbră a controlului principal apare la hover, cu deplasare și estompare discretă. O singură intrare animată a fotografiei folosește decupare și luminozitate; preferința pentru mișcare redusă dezactivează animațiile.

## Shapes

Colțurile sunt aproape drepte. Câmpurile, butonul și fotografiile folosesc o curbură foarte mică. Iconurile Lucide au o linie subțire, consecventă. Floarea din marcă este un semn geometric simplu.

## Components

### Buttons
Acțiunea principală ocupă lățimea formularului, cu text în stânga și săgeată în dreapta. Hover-ul schimbă verdele și deplasează săgeata. Trimiterea afișează indicatorul de progres și blochează retrimiterea; focusul are contur de cupru.

### Inputs
Contur verde, fond transparent și etichetă permanentă. Focusul adaugă fondul Paper. Erorile sunt textuale, asociate semantic câmpurilor, cu contur distinct. Valorile completate rămân în formular la eroare.

### Navigation
Marca este un link către pagina principală. Participarea folosește ancore către formular. Legăturile juridice au subliniere discretă; cele din formular anunță deschiderea într-o filă nouă.

### Countdown
Patru coloane tipografice, fără carduri decorative. Cifrele serif sunt separate discret și însoțite de etichete. Timerul nu anunță vocal fiecare secundă.

### Consent
Bife vizibile, cu etichete pe care se poate apăsa și legături separate către documente. Erorile și starea dezactivată sunt păstrate în același sistem vizual ca restul formularului.

## Do's and Don'ts

### Do
- Folosește fotografiile reale și păstrează atmosfera lor.
- Păstrează contrastul textului secundar și al placeholder-elor.
- Folosește serif pentru voce și sans pentru completarea formularului.

### Don't
- Nu inventa servicii, recenzii sau numere de participanți.
- Nu schimba cadrele fotografiilor în bannere panoramice.
- Nu adăuga scopuri concurente formularului de participare.
