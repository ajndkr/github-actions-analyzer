# github actions analyzer

a web application to analyze github actions usage data from csv exports, helping
identify optimization opportunities and cost patterns.

## features

- upload github actions usage csv files
- view summary statistics (total workflows, minutes, cost)
- visualize workflow consumption patterns
- identify top consumers of github actions minutes
- light/dark theme support

## setup

### prerequisites

- node.js (v16 or newer)
- npm

### installation

```bash
npm install
```

### development

```bash
npm run dev
```

the application will be available at http://localhost:5173/

## usage

1. export your github actions usage data as a csv file from the github billing
   page
2. upload the csv file to the application
3. view the analysis results and identify optimization opportunities

## technologies

- react
- typescript
- vite
- chart.js
- tailwind css
- zustand (state management)
